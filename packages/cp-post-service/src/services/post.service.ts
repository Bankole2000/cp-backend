import { Driver, getDriver, ServiceResponse } from '@cribplug/common';
import { PrismaClient } from '@prisma/client';
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

  async getPostDetails(postId: string) {
    try {
      const postDetails = await this.prisma.post.findUnique({
        where: {
          id: postId,
        },
        include: {
          postMedia: {
            orderBy: {
              order: 'asc',
            }
          },
          moderation: true,
          _count: {
            select: {
              comments: true,
              likedBy: true,
              postMedia: true,
              views: true,
            }
          },
          createdByData: {
            select: {
              displayname: true,
              username: true,
              userId: true,
              roles: true,
            }
          },
          tags: true,
        }
      });
      console.log({ postDetails });
      if (postDetails) {
        return new ServiceResponse('Post details', postDetails, true, 200, null, null, null);
      }
      return new ServiceResponse('Post Not found', postDetails, false, 404, 'Post not found', 'POST_SERVICE_ERROR_POST_NOT_FOUND', 'Check postId, logs and database');
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
}
