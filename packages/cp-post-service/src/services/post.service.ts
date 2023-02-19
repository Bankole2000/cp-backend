import { Driver, getDriver, ServiceResponse } from '@cribplug/common';
import { PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';

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
}
