import { Driver, getDriver, ServiceResponse } from '@cribplug/common';
import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';

export default class CommentDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  async getLikedIds(userId: string, postId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        userId,
      },
      include: {
        userLikedComments: {
          where: {
            comment: {
              postId
            }
          }
        }
      }
    });
    if (user) {
      const followingIds = user.following.length ? user.following : [];
      const followerIds = user.followers.length ? user.followers : [];
      const blockedIds = user.blocked.length ? user.blocked : [];
      const blockedByIds = user.blockedBy.length ? user.blockedBy : [];
      const likedIds = user.userLikedComments.length
        ? user.userLikedComments.map((x) => x.commentId)
        : [];
      return {
        followingIds,
        followerIds,
        blockedByIds,
        blockedIds,
        likedIds
      };
    }
    return {
      followingIds: [],
      followerIds: [],
      blockedIds: [],
      blockedByIds: [],
      likedIds: [],
    };
  }

  async getPostComments(
    postId: string,
    sort = 'latest',
    page = 1,
    limit = 12,
    loggedInUserId: string | null = null
  ) {
    let orderBy: Prisma.Enumerable<Prisma.CommentOrderByWithRelationInput>;
    if (sort === 'latest') {
      orderBy = [
        { pinned: 'desc' },
        { createdAt: 'desc' }
      ];
    } else {
      orderBy = [
        { pinned: 'desc' },
        {
          childComments: {
            _count: 'desc'
          }
        },
        {
          likedBy: {
            _count: 'desc'
          }
        }
      ];
    }
    try {
      const comments = await this.prisma.comment.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          AND: [
            {
              postId,
            },
            {
              OR: [
                {
                  parentCommentId: ''
                },
                {
                  parentCommentId: null
                }
              ]
            }
          ]
        },
        include: {
          _count: {
            select: {
              childComments: true,
              likedBy: true,
            }
          },
          author: true,
          media: true,
        },
        orderBy
      });
      const total = await this.prisma.comment.count({
        where: {
          postId
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      if (comments.length && loggedInUserId) {
        const {
          followerIds, followingIds, blockedIds, blockedByIds, likedIds
        } = await this.getLikedIds(loggedInUserId, postId);
        console.log({ likedIds });
        data = comments.map((c) => ({
          ...c,
          followsYou: followerIds.length
            ? followerIds.includes(c.authorId) : false,
          followedByYou: followingIds.length
            ? followingIds.includes(c.authorId) : false,
          blockedByYou: blockedIds.length
            ? blockedIds.includes(c.authorId) : false,
          blockedYou: blockedByIds.length
            ? blockedByIds.includes(c.authorId) : false,
          likedByYou: likedIds.length
            ? likedIds.includes(c.id) : false,
        }));
      } else {
        data = comments.map((c) => ({
          ...c,
          followsYou: false,
          followedByYou: false,
          blockedByYou: false,
          blockedYou: false,
          likedByYou: false,
        }));
      }
      return new ServiceResponse(
        'Post comments',
        {
          total, data, page, pages, limit, prev, next
        },
        true,
        200,
        null,
        null,
        null
      );
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting post comments', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getCommentDetails(commentId: string, postId: string, loggedInUserId: string | null = null) {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: {
          id: commentId
        },
        include: {
          _count: {
            select: {
              childComments: true,
              likedBy: true,
            }
          },
          author: true,
          media: true,
        },
      });
      if (comment) {
        let data: { [key: string]: any } = {};
        data = {
          ...comment
        };
        if (loggedInUserId) {
          const {
            followerIds, followingIds, blockedIds, blockedByIds, likedIds
          } = await this.getLikedIds(loggedInUserId, postId);
          data.followsYou = followerIds.length
            ? followerIds.includes(comment.authorId) : false;
          data.followedByYou = followingIds.length
            ? followingIds.includes(comment.authorId) : false;
          data.blockedByYou = blockedIds.length
            ? blockedIds.includes(comment.authorId) : false;
          data.blockedYou = blockedByIds.length
            ? blockedByIds.includes(comment.authorId) : false;
          data.likedByYou = likedIds.length
            ? likedIds.includes(comment.id) : false;
        } else {
          data.followsYou = false;
          data.followedByYou = false;
          data.blockedByYou = false;
          data.blockedYou = false;
          data.likedByYou = false;
        }
        return new ServiceResponse('Comment details', data, true, 200, null, null, null);
      }
      return new ServiceResponse('Comment not found', comment, false, 404, 'Error - Comment not found', 'POST_SERVICE_ERROR_COMMENT_NOT_FOUND', 'Check comment id and confirm comment exists');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting comment', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getCommentById(commentId: string) {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: {
          id: commentId
        }
      });
      if (comment) {
        return new ServiceResponse('Comment found', comment, true, 200, null, null, null);
      }
      return new ServiceResponse('Comment not found', comment, false, 404, 'Error - comment not found', 'POST_SERVICE_ERROR_COMMENT_NOT_FOUND', 'Check comment Id and that comment exists');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting comment by Id', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async createComment(
    postId: string,
    userId: string,
    content: string | null = null,
    parentCommentId: string | null = null
  ) {
    try {
      const comment = await this.prisma.comment.create({
        data: {
          authorId: userId,
          postId,
          content,
          parentCommentId,
        },
        include: {
          _count: {
            select: {
              childComments: true,
              likedBy: true,
            }
          },
          author: true,
          media: true,
          post: {
            include: {
              _count: {
                select: {
                  comments: true
                }
              }
            }
          },
          parentComment: true,
        },
      });
      if (comment) {
        return new ServiceResponse('Comment created', comment, true, 200, null, null, null);
      }
      return new ServiceResponse('Error creating comment', comment, false, 400, 'Error creating comment', 'POST_SERVICE_ERROR_CREATING_COMMENT', 'Check inputs and post Id');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating comment on post', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async updateComment(
    commentId: string,
    content: string | null = null,
  ) {
    try {
      const updatedComment = await this.prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          content
        },
        include: {
          _count: {
            select: {
              childComments: true,
              likedBy: true,
            }
          },
          author: true,
          media: true,
        },
      });
      if (updatedComment) {
        return new ServiceResponse('Comment updated', updatedComment, true, 200, null, null, null);
      }
      return new ServiceResponse('Error updating comment', updatedComment, false, 400, 'Error updating comment', 'POST_SERVICE_ERROR_UPDATING_COMMENT', 'Check inputs and comment Id');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error updating comment', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async deleteComment(commentId: string) {
    try {
      const deletedComment = await this.prisma.comment.delete({
        where: {
          id: commentId
        },
        include: {
          _count: {
            select: {
              childComments: true,
              likedBy: true,
            }
          },
          author: true,
          media: true,
        },
      });
      if (deletedComment) {
        return new ServiceResponse('Comment deleted', deletedComment, true, 200, null, null, null);
      }
      return new ServiceResponse('Error deleting comment', deletedComment, false, 404, 'Error deleting comment', 'POST_SERVICE_ERROR_DELETING_COMMENT', 'Check comment exists and commentId');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error deleting comment', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async pinComment(commentId: string, pin = false) {
    try {
      const pinnedComment = await this.prisma.comment.update({
        where: {
          id: commentId
        },
        data: {
          pinned: pin
        }
      });
      if (pinnedComment) {
        return new ServiceResponse(`Comment ${pin ? 'pinned' : 'unpinned'}`, pinnedComment, true, 200, null, null, null);
      }
      return new ServiceResponse(
        `Error ${pin ? 'pinning' : 'unpinning'} comment`,
        pinnedComment,
        false,
        400,
        `Error ${pin ? 'pinning' : 'unpinning'} comment`,
        `POST_SERVICE_ERROR_${pin ? '' : 'UN'}PINNING_COMMENT`,
        'Check inputs, logs and database'
      );
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error pinning comment', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async checkUserLikesComment(userId: string, commentId: string) {
    try {
      const likedComment = await this.prisma.userLikesComment.findUnique({
        where: {
          commentId_userId: {
            userId,
            commentId,
          }
        }
      });
      if (likedComment) {
        return new ServiceResponse('User liked comment', likedComment, true, 200, null, null, null);
      }
      return new ServiceResponse('User liked comment not found', likedComment, false, 404, 'User Comment like not found', 'POST_SERVICE_ERROR_USER_COMMENT_LIKE_NOT_FOUND', 'Check user previously liked comment');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error checking if user liked comment', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async likeComment(userId: string, commentId: string) {
    try {
      const likedComment = await this.prisma.userLikesComment.create({
        data: {
          commentId,
          userId
        },
        include: {
          user: true,
          comment: {
            include: {
              _count: {
                select: {
                  childComments: true,
                  likedBy: true,
                }
              },
              author: true
            }
          },
        }
      });
      if (likedComment) {
        return new ServiceResponse('Comment liked', likedComment, true, 200, null, null, null);
      }
      return new ServiceResponse('Error liking comment', likedComment, false, 400, 'Error liking comment', 'POST_SERVICE_ERROR_LIKING_COMMENT', 'Check inputs, userId, and commenId');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error liking comment', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async unlikeComment(userId: string, commentId: string) {
    try {
      const unlikedComment = await this.prisma.userLikesComment.delete({
        where: {
          commentId_userId: {
            userId,
            commentId
          }
        },
        include: {
          comment: {
            include: {
              _count: {
                select: {
                  childComments: true,
                  likedBy: true,
                }
              }
            }
          }
        }
      });
      if (unlikedComment) {
        return new ServiceResponse('Comment unliked', unlikedComment, true, 200, null, null, null);
      }
      return new ServiceResponse('Error unliking comment', unlikedComment, false, 400, 'Error unliking comment', 'POST_SERVICE_ERROR_UNLIKING_COMMENT', 'Check inputs');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error unliking comment', null, false, 500, error.message, error, 'Check logs and database');
    }
  }
}
