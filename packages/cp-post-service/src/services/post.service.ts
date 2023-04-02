import { Driver, getDriver, ServiceResponse } from '@cribplug/common';
import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { getTagsFromCaption, getUrlsFromCaption } from '../utils/utils';

export default class PostDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  async createPostIntent(postData: any) {
    try {
      const postToUpdate = await this.prisma.post.create({
        data: {
          ...postData
        },
        include: {
          postMedia: true,
          repost: {
            include: {
              postMedia: true,
              createdByData: true
            }
          },
          moderation: true
        }
      });
      if (postToUpdate) {
        return new ServiceResponse('New Post created', postToUpdate, true, 200, null, null, null);
      }
      return new ServiceResponse('Error creating new post', postToUpdate, false, 400, 'Error creating post', 'POST_SERVICE_ERROR_CREATING_POST', 'Check flow, logs, and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating post', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async createRepost(repostId: string, createdBy: string) {
    try {
      const repost = await this.prisma.post.create({
        data: {
          repostId,
          createdBy,
        },
        include: {
          repost: true
        }
      });
      if (repost) {
        return new ServiceResponse('Post reposted', repost, true, 200, null, null, null);
      }
      return new ServiceResponse('Error reposting', repost, false, 400, 'Error reposting', 'POST_SERVICE_ERROR_CREATING_REPOST', 'Check inputs and Ids');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating repost', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getLikedIds(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        userId,
      },
      include: {
        savedPosts: true,
        userLikedPosts: true,
        posts: true,
        reportedPosts: true,
        viewed: true,
      }
    });
    if (user) {
      const followingIds = user.following.length ? user.following : [];
      const followerIds = user.followers.length ? user.followers : [];
      const blockedIds = user.blocked.length ? user.blocked : [];
      const blockedByIds = user.blockedBy.length ? user.blockedBy : [];
      const savedIds = user.savedPosts.length ? user.savedPosts.map((x) => x.postId) : [];
      const repostIds = user.posts.length
        ? user.posts.filter((x) => !!x.repostId).map((x) => x.repostId) : [];
      const reportedIds = user.reportedPosts.length ? user.reportedPosts.map((x) => x.postId) : [];
      const viewedIds = user.viewed.length ? user.viewed.map((x) => x.postId) : [];
      const likedIds = user.userLikedPosts.length ? user.userLikedPosts.map((x) => x.postId) : [];
      return {
        followingIds,
        followerIds,
        blockedIds,
        blockedByIds,
        savedIds,
        repostIds,
        reportedIds,
        viewedIds,
        likedIds,
      };
    }
    return {
      followingIds: [],
      followerIds: [],
      blockedIds: [],
      blockedByIds: [],
      savedIds: [],
      repostIds: [],
      reportedIds: [],
      viewedIds: [],
      likedIds: [],
    };
  }

  async setDraftPostCaption(postId: string, caption: string) {
    try {
      const updatedPost = await this.prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          caption,
          tags: {
            set: []
          }
        },
        include: {
          postMedia: {
            orderBy: {
              order: 'asc'
            }
          },
          tags: true,
        }
      });
      if (updatedPost) {
        return new ServiceResponse('Post caption set', updatedPost, true, 200, null, null, null);
      }
      return new ServiceResponse('Error updating post', updatedPost, false, 400, 'Error setting post caption', 'POST_SERVICE_ERROR_SETTING_POST_CAPTION', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error setting post caption', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async setPostCaption(postId: string, caption: string) {
    const tags = getTagsFromCaption(caption);
    const urls = getUrlsFromCaption(caption);
    try {
      const updatedPost = await this.prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          caption,
          tags: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag }
            }))
          },
          urls: {
            set: urls
          }
        },
        include: {
          tags: true,
        }
      });
      if (updatedPost) {
        return new ServiceResponse('Post caption set', updatedPost, true, 200, null, null, null);
      }
      return new ServiceResponse('Error updating post', updatedPost, false, 400, 'Error setting post caption', 'POST_SERVICE_ERROR_SETTING_POST_CAPTION', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error setting post caption', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getPostById(postId: string) {
    try {
      const post = await this.prisma.post.findUnique({
        where: {
          id: postId,
        },
        include: {
          postMedia: {
            orderBy: {
              order: 'asc'
            },
          }
        }
      });
      if (post) {
        return new ServiceResponse('Post found', post, true, 200, null, null, null);
      }
      return new ServiceResponse('Post not found', post, false, 404, 'Post not found', 'POST_SERVICE_POST_BY_ID_NOT_FOUND', 'Check post Id, logs, and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting post', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getPostMedia(postId: string) {
    try {
      const postMedia = await this.prisma.postMedia.findMany({
        where: {
          post: postId,
        }
      });
      return new ServiceResponse('Post Media', postMedia, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting post media', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getMediaById(mediaId: string) {
    try {
      const postMedia = await this.prisma.postMedia.findUnique({
        where: {
          id: mediaId
        }
      });
      if (postMedia) {
        return new ServiceResponse('Post media by Id', postMedia, true, 200, null, null, null);
      }
      return new ServiceResponse('Error getting post media', postMedia, false, 400, 'Error getting post media', 'POST_SERVICE_ERROR_FETCHING_POST_MEDIA', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting post media', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async addPostMedia(mediaData: any) {
    try {
      const newPostMedia = await this.prisma.postMedia.create({
        data: {
          ...mediaData
        }
      });
      if (newPostMedia) {
        return new ServiceResponse('Post media added', newPostMedia, true, 200, null, null, null);
      }
      return new ServiceResponse('Error adding post media', newPostMedia, false, 400, 'Error adding post media', 'POST_SERVICE_ERROR_ADDING_POST_MEDIA', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error adding post media', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async setMediaOrder(mediaId: string, order: number) {
    try {
      const orderedMedia = await this.prisma.postMedia.update({
        where: {
          id: mediaId,
        },
        data: {
          order,
        }
      });
      if (orderedMedia) {
        return new ServiceResponse('Post Media ordered', orderedMedia, true, 200, null, null, null);
      }
      return new ServiceResponse('Error ordering Post Media', orderedMedia, false, 400, 'Error ordering post media', 'POST_SERVICE_ERROR_ORDERING_POST_MEDIA', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error setting post media order', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async reorderPostMediaForward(order: number, postId: string, mediaId: string, stop = 0) {
    try {
      const reorderedMedia = await this.prisma.postMedia.updateMany({
        where: {
          AND: [
            {
              post: postId,
            },
            {
              order: {
                gte: order,
                lt: stop
              }
            },
            {
              id: {
                not: mediaId,
              }
            }
          ]
        },
        data: {
          order: {
            increment: 1,
          }
        }
      });
      console.log({ reorderedMedia });
      if (reorderedMedia) {
        return new ServiceResponse('Post media reordered', reorderedMedia, true, 200, null, null, null);
      }
      return new ServiceResponse('Error reordering post media', reorderedMedia, false, 400, 'Error reordering post media', 'POST_SERVICE_ERROR_REORDERING_POST_MEDIA', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error reordering post media', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async reorderPostMediaBackward(order: number, postId: string, mediaId: string, stop = 0) {
    try {
      const reorderedMedia = await this.prisma.postMedia.updateMany({
        where: {
          AND: [
            {
              post: postId,
            },
            {
              order: {
                lte: order,
                gt: stop
              }
            },
            {
              id: {
                not: mediaId,
              }
            }
          ]
        },
        data: {
          order: {
            increment: -1,
          }
        }
      });
      console.log({ reorderedMedia });
      if (reorderedMedia) {
        return new ServiceResponse('Post media reordered', reorderedMedia, true, 200, null, null, null);
      }
      return new ServiceResponse('Error reordering post media', reorderedMedia, false, 400, 'Error reordering post media', 'POST_SERVICE_ERROR_REORDERING_POST_MEDIA', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error reordering post media', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async deletePostMedia(mediaId: string) {
    try {
      const deletedMedia = await this.prisma.postMedia.delete({
        where: {
          id: mediaId,
        }
      });
      if (deletedMedia) {
        return new ServiceResponse('Post media deleted', deletedMedia, true, 200, null, null, null);
      }
      return new ServiceResponse('Error deleting post media', deletedMedia, false, 400, 'Error deleting post media', 'POST_SERVICE_ERROR_DELETING_POST_MEDIA', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error deleting post media', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getPostDetails(
    postId: string,
    loggedInUserId: string | null = null
  ) {
    try {
      const post = await this.prisma.post.findUnique({
        where: {
          id: postId,
        },
        include: {
          _count: {
            select: {
              comments: true,
              likedBy: true,
              postMedia: true,
              tags: true,
              views: true
            }
          },
          postMedia: {
            orderBy: {
              order: 'asc',
            }
          },
          createdByData: true,
          moderation: true,
          tags: true,
          repost: {
            include: {
              _count: {
                select: {
                  comments: true,
                  likedBy: true,
                  postMedia: true,
                  tags: true,
                  views: true
                }
              },
              postMedia: {
                orderBy: {
                  order: 'asc',
                }
              },
              createdByData: true,
              moderation: true,
              tags: true,
            }
          }
        }
      });
      if (post) {
        console.log(`Got Post - ${post.id}`);
        let data: { [key: string]: any } = {};
        data = {
          ...post
        };
        const isRepost = post.repostId && !post.caption && !post.postMedia.length;
        data.repostCount = isRepost
          ? (await this.getRepostCount(post.repostId as string)).data.count
          : (await this.getRepostCount(post.id)).data.count;
        data.repostOnlyCount = isRepost
          ? (await this.getRepostOnlyCount(post.repostId as string)).data.count
          : (await this.getRepostOnlyCount(post.id)).data.count;
        data.quoteRepostCount = isRepost
          ? (await this.getQuoteRepostOnlyCount(post.repostId as string)).data.count
          : (await this.getQuoteRepostOnlyCount(post.id)).data.count;
        console.log('Got repost counts');
        if (loggedInUserId) {
          const {
            followerIds, followingIds, reportedIds, repostIds, savedIds, viewedIds, likedIds
          } = await this.getLikedIds(loggedInUserId);
          data.followsYou = !isRepost
            ? followingIds.includes(post.createdBy)
            : followingIds.includes(post.repost?.createdBy as string);
          data.followedByYou = !isRepost
            ? followerIds.includes(post.createdBy)
            : followerIds.includes(post.repost?.createdBy as string);
          data.reportedByYou = reportedIds.length
            ? reportedIds.includes(isRepost ? post.repostId as string : post.id)
            : false;
          data.savedByYou = savedIds.length
            ? savedIds.includes(isRepost ? post.repostId as string : post.id)
            : false;
          data.repostedByYou = (post.repostId && post.postMedia.length)
            || (post.repostId && post.caption)
            || !post.repostId
            ? repostIds.includes(post.id) : repostIds.includes(post.repostId);
          data.viewedByYou = viewedIds.length
            ? viewedIds.includes(isRepost ? post.repostId as string : post.id)
            : false;
          data.likedByYou = (post.repostId && post.postMedia.length)
            || (post.repostId && post.caption)
            || !post.repostId
            ? likedIds.includes(post.id) : likedIds.includes(post.repostId);
          data.authoredByYou = post.repostId
            ? post.repost?.createdBy === loggedInUserId
            : post.createdBy === loggedInUserId;
          console.log('Got user specific details');
        } else {
          data.followsYou = false;
          data.followedByYou = false;
          data.reportedByYou = false;
          data.savedByYou = false;
          data.repostedByYou = false;
          data.viewedByYou = false;
          data.likedByYou = false;
          data.authoredByYou = false;
        }
        console.log('Returning reponse');
        return new ServiceResponse('Post details', data, true, 200, null, null, null);
      }
      return new ServiceResponse('Post Not found', post, false, 404, 'Post not found', 'POST_SERVICE_ERROR_POST_NOT_FOUND', 'Check postId, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting post details', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async addPostToModerationQueue(postId: string, status = 'PENDING', autoModerate = true, contentWarning = false, publishAt: Date | null = null) {
    try {
      const postModeration = await this.prisma.moderationQueue.upsert({
        create: {
          postId,
          autoModerate,
          contentWarning,
          moderated: false,
          publishAt,
          status,
        },
        where: {
          postId,
        },
        update: {
          postId,
          autoModerate,
          moderated: false,
          publishAt,
          status,
        },
        include: {
          post: {
            include: {
              postMedia: true,
              tags: true,
              _count: {
                select: {
                  comments: true,
                  likedBy: true,
                  postMedia: true,
                  tags: true,
                  views: true
                }
              },
              repost: {
                include: {
                  postMedia: true,
                  _count: {
                    select: {
                      comments: true,
                      likedBy: true,
                      postMedia: true,
                      tags: true,
                      views: true
                    }
                  }
                }
              }
            }
          },
          moderation: true,
          reports: true,
        }
      });
      console.log({ postModeration });
      if (postModeration) {
        return new ServiceResponse('Post added to Moderation Queue', postModeration, true, 200, null, null, null);
      }
      return new ServiceResponse('Error adding post to moderation queue', postModeration, false, 400, 'Error adding post to moderation queue', 'POST_SERVICE_ERROR_ADDING_POST_TO_MODERATION_QUEUE', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error adding post to moderation queue', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getPostOnModerationQueue(postId: string) {
    try {
      const moderation = await this.prisma.moderationQueue.findUnique({
        where: {
          postId,
        },
        include: {
          post: true,
        }
      });
      if (moderation) {
        return new ServiceResponse('Post moderation found', moderation, true, 200, null, null, null);
      }
      return new ServiceResponse('Post moderation not found', moderation, false, 404, 'Not found', 'POST_SERVICE_MODERATION_QUEUE_POST_NOT_FOUND', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting post moderation details', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async markPostAsPublished(postId: string, caption = '') {
    const tags = getTagsFromCaption(caption);
    const urls = getUrlsFromCaption(caption);
    try {
      const publishedPost = await this.prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          published: true,
          tags: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag }
            }))
          },
          urls: {
            set: urls
          },
          version: {
            increment: 1,
          }
        },
        include: {
          _count: {
            select: {
              comments: true,
              likedBy: true,
              postMedia: true,
              tags: true,
              views: true
            }
          },
          postMedia: {
            orderBy: {
              order: 'asc',
            }
          },
          createdByData: true,
          moderation: true,
          tags: true,
          repost: {
            include: {
              _count: {
                select: {
                  comments: true,
                  likedBy: true,
                  postMedia: true,
                  tags: true,
                  views: true
                }
              },
              postMedia: {
                orderBy: {
                  order: 'asc',
                }
              },
              createdByData: true,
              moderation: true,
              tags: true,
            }
          }
        }
      });
      console.log({ publishedPost });
      if (publishedPost) {
        return new ServiceResponse('Post published', publishedPost, true, 200, null, null, null);
      }
      return new ServiceResponse('Error marking post as published', publishedPost, false, 400, 'Error publishing post', 'POST_SERVICE_ERROR_PUBLISHING_POST', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error marking post as published', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async unpublishPost(postId: string) {
    try {
      const unpublishedPost = await this.prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          published: false,
          tags: {
            set: []
          }
        },
        include: {
          _count: {
            select: {
              comments: true,
              likedBy: true,
              postMedia: true,
              tags: true,
              views: true
            }
          },
          postMedia: {
            orderBy: {
              order: 'asc',
            }
          },
          createdByData: true,
          moderation: true,
        }
      });
      if (unpublishedPost) {
        return new ServiceResponse('Post unpublished', unpublishedPost, true, 200, null, null, null);
      }
      return new ServiceResponse('Error unpublishing post', unpublishedPost, false, 400, 'Error archiving post', 'POST_SERVICE_ERROR_UNPUBLISHING_POST', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error unpublishing post', null, false, 400, error.message, error, 'Check logs and database');
    }
  }

  async likePost(postId: string, userId: string) {
    try {
      const likedPost = await this.prisma.userLikesPost.create({
        data: {
          postId,
          userId
        },
        include: {
          post: {
            include: {
              _count: {
                select: {
                  likedBy: true
                }
              }
            }
          }
        }
      });
      if (likedPost) {
        return new ServiceResponse('Post liked', likedPost, true, 200, null, null, null);
      }
      return new ServiceResponse('Error liking post', likedPost, false, 400, 'Error liking post', 'POST_SERVICE_ERROR_LIKING_POST', 'Check user Id and post Id');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error liking post', null, false, 500, 'Error liking post', 'POST_SERVICE_ERROR_LIKING_POST', 'Check logs and database');
    }
  }

  async unlikePost(postId: string, userId: string) {
    try {
      const unlikedPost = await this.prisma.userLikesPost.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
        include: {
          post: {
            include: {
              _count: {
                select: {
                  likedBy: true
                }
              }
            }
          }
        }
      });
      if (unlikedPost) {
        return new ServiceResponse('Post unliked', unlikedPost, true, 200, null, null, null);
      }
      return new ServiceResponse('Error unliking post', unlikedPost, false, 400, 'Error unliking post', 'POST_SERVICE_ERROR_UNLIKING_POST', 'Check user previously liked post');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error unliking post', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getPostLikes(postId: string, page = 1, limit = 12, loggedInUserId: string | null = null) {
    try {
      const postLikes = await this.prisma.userLikesPost.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          postId,
        },
        include: {
          user: true,
        }
      });
      const total = await this.prisma.userLikesPost.count({
        where: {
          postId,
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      if (postLikes.length && loggedInUserId) {
        const {
          followingIds, followerIds, blockedIds, blockedByIds
        } = await this.getLikedIds(loggedInUserId);
        data = postLikes.map((like) => ({
          ...like,
          followsYou: followingIds.length ? followingIds.includes(like.userId) : false,
          followedByYou: followerIds.length ? followerIds.includes(like.userId) : false,
          blockedYou: blockedByIds.length ? blockedByIds.includes(like.userId) : false,
          blockedByYou: blockedIds.length ? blockedIds.includes(like.userId) : false,
          isYou: like.userId === loggedInUserId
        }));
      } else {
        data = postLikes;
      }
      return new ServiceResponse('Post Likes', {
        total, data, page, pages, limit, prev, next
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting post likes', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async checkUserLikedPost(postId: string, userId: string) {
    try {
      const likedPost = await this.prisma.userLikesPost.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          }
        }
      });
      if (likedPost) {
        return new ServiceResponse('You already liked this post', likedPost, true, 200, null, null, null);
      }
      return new ServiceResponse('You have not liked this post', likedPost, false, 404, 'Error - post not liked by user', 'POST_SERVICE_USER_HAS_NOT_LIKED_POST', 'Check user has previously liked post');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting liked post', null, false, 500, 'Error checking liked post', 'POST_SERVICE_ERROR_CHECKING_LIKED_POST', 'Check logs and database');
    }
  }

  async getRepostCount(postId: string) {
    try {
      const repostCount = await this.prisma.post.count({
        where: {
          repostId: postId,
        }
      });
      return new ServiceResponse('Repost count', { count: repostCount, postId }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting post repost count', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getRepostOnlyCount(postId: string) {
    try {
      const repostCount = await this.prisma.post.count({
        where: {
          repostId: postId,
          AND: [
            {
              OR: [
                {
                  caption: ''
                },
                {
                  caption: null
                }
              ]
            },
            {
              postMedia: {
                none: {
                  order: {
                    gt: -1
                  }
                }
              }
            }
          ]
        }
      });
      return new ServiceResponse('Repost count', { count: repostCount, postId }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting post repost count', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getQuoteRepostOnlyCount(postId: string) {
    try {
      const repostCount = await this.prisma.post.count({
        where: {
          repostId: postId,
          AND: {
            OR: [
              {
                caption: {
                  not: '' || null,
                }
              },
              {
                postMedia: {
                  some: {
                    order: {
                      gt: -1
                    }
                  }
                }
              }
            ]
          }
        }
      });
      return new ServiceResponse('Quote repost count', { count: repostCount, postId }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting post repost count', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getRepostedBy(
    postId: string,
    page = 1,
    limit = 12,
    loggedInUserId: string | null = null
  ) {
    try {
      const postRepostedUsers = await this.prisma.post.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          repostId: postId,
        },
        include: {
          createdByData: true,
          postMedia: true,
        }
      });
      const total = await this.prisma.post.count({
        where: {
          repostId: postId,
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      if (postRepostedUsers && loggedInUserId) {
        const {
          followerIds, followingIds, blockedIds, blockedByIds,
        } = await this.getLikedIds(loggedInUserId);
        data = postRepostedUsers.map((post) => ({
          user: post.createdByData,
          followsYou: followingIds.length ? followingIds.includes(post.createdBy) : false,
          followedByYou: followerIds.length ? followerIds.includes(post.createdBy) : false,
          blocked: blockedIds.length ? blockedIds.includes(post.createdBy) : false,
          blockedBy: blockedByIds.length ? blockedByIds.includes(post.createdBy) : false,
          isYou: post.createdBy === loggedInUserId,
        }));
      } else {
        data = postRepostedUsers.map((post) => ({
          user: post.createdByData,
          followsYou: false,
          followedByYou: false,
          blocked: false,
          blockedBy: false,
          isYou: false,
        }));
      }
      return new ServiceResponse('Post reposted by', {
        pages, prev, next, data, total, page
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting reposted by', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getQuotePosts(
    postId: string,
    page = 1,
    limit = 12,
    filter = 'latest',
    loggedInUserId: string | null = null
  ) {
    let orderBy: Prisma.Enumerable<Prisma.PostOrderByWithRelationInput>;
    if (filter === 'latest') {
      orderBy = [{ created: 'desc' }];
    } else {
      orderBy = [
        {
          likedBy: {
            _count: 'desc'
          }
        },
        {
          comments: {
            _count: 'desc'
          }
        }
      ];
    }
    try {
      const posts = await this.prisma.post.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          repostId: postId,
          AND: {
            OR: [
              {
                caption: {
                  not: '' || null,
                }
              },
              {
                postMedia: {
                  some: {
                    order: {
                      gt: -1
                    }
                  }
                }
              }
            ]
          }
        },
        include: {
          createdByData: true,
          postMedia: {
            orderBy: {
              order: 'asc'
            }
          },
          moderation: true,
          repost: {
            include: {
              createdByData: {
                select: {
                  displayname: true,
                  username: true,
                }
              },
              postMedia: {
                orderBy: {
                  order: 'asc'
                }
              },
              moderation: true,
              _count: {
                select: {
                  likedBy: true,
                  comments: true,
                  postMedia: true,
                  views: true,
                  reposts: true,
                }
              },
              likedBy: true,
            }
          },
          _count: {
            select: {
              likedBy: true,
              comments: true,
              postMedia: true,
              views: true,
              reposts: true,
            }
          },
          tags: true,
        },
        orderBy
      });
      const total = await this.prisma.post.count({
        where: {
          repostId: postId,
          AND: {
            OR: [
              {
                caption: {
                  not: '' || null,
                }
              },
              {
                postMedia: {
                  some: {
                    order: {
                      gt: -1
                    }
                  }
                }
              }
            ]
          }
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      if (posts.length && loggedInUserId) {
        const {
          followerIds, followingIds, reportedIds, repostIds, savedIds, viewedIds, likedIds
        } = await this.getLikedIds(loggedInUserId);
        data = posts.map((post) => ({
          ...post,
          followsYou: followingIds.length ? followingIds.includes(post.createdBy) : false,
          followedByYou: followerIds.length ? followerIds.includes(post.createdBy) : false,
          reportedByYou: reportedIds.length ? reportedIds.includes(post.id) : false,
          savedByYou: savedIds.length ? savedIds.includes(post.id) : false,
          repostedByYou: (post.repostId && post.postMedia.length)
            || (post.repostId && post.caption)
            || !post.repostId
            ? repostIds.includes(post.id) : repostIds.includes(post.repostId),
          viewedByYou: viewedIds.length ? viewedIds.includes(post.id) : false,
          likedByYou: (post.repostId && post.postMedia.length)
            || (post.repostId && post.caption)
            || !post.repostId
            ? likedIds.includes(post.id) : likedIds.includes(post.repostId),
          authoredByYou: post.repostId
            ? post.repost?.createdBy === loggedInUserId
            : post.createdBy === loggedInUserId
        }));
      } else {
        data = posts;
      }
      return new ServiceResponse(
        'Quote Posts',
        {
          total, data, page, pages, limit, prev, next
        },
        true,
        200,
        null,
        null,
        null,
      );
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting qoute posts', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async checkUserHasReposted(postId: string, userId: string) {
    try {
      const repost = await this.prisma.post.findFirst({
        where: {
          createdBy: userId,
          repostId: postId,
          AND: [
            {
              OR: [
                {
                  caption: ''
                },
                {
                  caption: null
                }
              ]
            },
            {
              postMedia: {
                none: {
                  order: {
                    gt: -1
                  }
                }
              }
            }
          ]
        }
      });
      if (repost) {
        return new ServiceResponse('User has reposted before', repost, true, 200, null, null, null);
      }
      return new ServiceResponse('Repost not found', repost, false, 404, 'User has not reposted', 'POST_SERVICE_USER_REPOST_NOT_FOUND', 'Check user has reposted before');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error checking user repost', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async undoRepost(postId: string) {
    try {
      const undone = await this.prisma.post.delete({
        where: {
          id: postId
        },
        include: {
          repost: true,
        }
      });
      if (undone) {
        return new ServiceResponse('Repost deleted', undone, true, 200, null, null, null);
      }
      return new ServiceResponse('Error deleting repost', undone, false, 400, 'Error deleting repot', 'POST_SERVER_ERROR_DELETING_REPOST', 'Check user has reposted this post before');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error undoing user repost', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getLatestPublishedPosts(page = 1, limit = 12, loggedInUserId: string | null = null) {
    try {
      const posts = await this.prisma.post.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          published: true,
        },
        include: {
          _count: {
            select: {
              comments: true,
              likedBy: true,
              postMedia: true,
              tags: true,
              views: true
            }
          },
          postMedia: {
            orderBy: {
              order: 'asc',
            }
          },
          createdByData: true,
          moderation: true,
          tags: true,
          repost: {
            include: {
              _count: {
                select: {
                  comments: true,
                  likedBy: true,
                  postMedia: true,
                  tags: true,
                  views: true
                }
              },
              postMedia: {
                orderBy: {
                  order: 'asc',
                }
              },
              createdByData: true,
              moderation: true,
              tags: true,
            }
          }
        },
        orderBy: {
          created: 'desc'
        }
      });
      const promises: any[] = [];
      posts.forEach((p) => {
        const isRepost = p.repostId && !p.caption && !p.postMedia.length;
        if (isRepost) {
          promises.push(this.prisma.post.count({ where: { repostId: p.repostId } }));
        } else {
          promises.push(this.prisma.post.count({ where: { repostId: p.id } }));
        }
      });
      const repostCount = await Promise.all(promises);
      const total = await this.prisma.post.count({
        where: {
          published: true,
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      if (posts.length && loggedInUserId) {
        const {
          followerIds, followingIds, reportedIds, repostIds, savedIds, viewedIds, likedIds
        } = await this.getLikedIds(loggedInUserId);
        data = posts.map((post, i) => {
          const isRepost = post.repostId && !post.caption && !post.postMedia.length;
          return {
            ...post,
            followsYou: !isRepost
              ? followingIds.includes(post.createdBy)
              : followingIds.includes(post.repost?.createdBy as string),
            followedByYou: !isRepost
              ? followerIds.includes(post.createdBy)
              : followerIds.includes(post.repost?.createdBy as string),
            reportedByYou: reportedIds.length
              ? reportedIds.includes(isRepost ? post.repostId as string : post.id)
              : false,
            savedByYou: savedIds.length
              ? savedIds.includes(isRepost ? post.repostId as string : post.id)
              : false,
            repostCount: repostCount[i],
            repostedByYou:
              (post.repostId && post.postMedia.length)
                || (post.repostId && post.caption)
                || !post.repostId
                ? repostIds.includes(post.id) : repostIds.includes(post.repostId),
            viewedByYou: viewedIds.length
              ? viewedIds.includes(isRepost ? post.repostId as string : post.id)
              : false,
            likedByYou: (post.repostId && post.postMedia.length)
              || (post.repostId && post.caption)
              || !post.repostId
              ? likedIds.includes(post.id) : likedIds.includes(post.repostId),
            authoredByYou: post.repostId
              ? post.repost?.createdBy === loggedInUserId
              : post.createdBy === loggedInUserId
          };
        });
      } else {
        data = posts;
      }
      return new ServiceResponse(
        'User Posts',
        {
          total, data, page, pages, limit, prev, next
        },
        true,
        200,
        null,
        null,
        null,
      );
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting latest published posts', null, false, 500, error.message, error, 'Check logs and database');
    }
  }
}
