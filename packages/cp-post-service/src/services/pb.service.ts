import { ServiceEvent, ServiceResponse } from '@cribplug/common';
import 'cross-fetch/polyfill';

// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-unresolved
const PocketBase = require('pocketbase/cjs');

export default class PBService {
  pb: any;

  constructor(pbUrl: string) {
    this.pb = new PocketBase(pbUrl);
  }

  async authenticateAdmin(adminEmail: string, adminPassword: string) {
    try {
      const res = await this.pb.admins.authWithPassword(adminEmail, adminPassword);
      console.log({ res });
      if (res.token && res.record) {
        return new ServiceResponse('Admin authenticated', res, true, 200, null, null, null);
      }
      return new ServiceResponse('Admin not authenticated', null, false, 400, 'Error authenticating Admin in Pocketbase', null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error authenticating admin', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async checkAuth() {
    console.log({
      isValid: this.pb.authStore.isValid,
      model: this.pb.authStore.model,
      token: this.pb.authStore.token
    });
    return this.pb.authStore.isValid;
  }

  async saveAuth(token: any, model: any) {
    console.log({ token, model });
    try {
      this.pb.authStore.save(token, model);
    } catch (error: any) {
      console.log({ error });
    }
  }

  async refreshAuth() {
    try {
      const res = await this.pb.collection('users').authRefresh();
      console.log({ res });
      if (res.token && res.record) {
        return new ServiceResponse('Auth refreshed', res, true, 200, null, null, null);
      }
      return new ServiceResponse('Auth not refreshed', res, false, 400, 'Error refreshing auth in Pocketbase', null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error refreshing auth', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async createPost(postData: any) {
    try {
      const res = await this.pb.collection('posts').create(postData);
      console.log({ res });
      if (res.id) {
        return new ServiceResponse('Post Created', res, true, 200, null, null, null);
      }
      return new ServiceResponse('Error creating post', res, false, res.code || 400, res.message || 'Error creating post', res || 'POST_SERVICE_ERROR_CREATING_POST_POCKETBASE', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating post', null, false, 500, error.message, error, 'Check pocketbase logs and database');
    }
  }

  async addPostMedia(mediaData: any) {
    console.log('reached here 75');
    try {
      const res = await this.pb.collection('postMedia').create(mediaData);
      console.log('Reached here 78');
      console.log({ res });
      if (res.id) {
        return new ServiceResponse('Post media added', res, true, 200, null, null, null);
      }
      return new ServiceResponse('Error adding post media', res, false, res.code || 400, res.message || 'Error adding post media', res || 'POST_SERVICE_POCKETBASE_ERROR_UPLOADING_POST_MEDIA', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error adding post media', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async addPostGif(mediaData: any) {
    console.log('reached here 91');
    try {
      const res = await this.pb.collection('postMedia').create(mediaData);
      console.log('Reached here 94');
      console.log({ res });
      if (res.id) {
        return new ServiceResponse('Post gif added', res, true, 200, null, null, null);
      }
      return new ServiceResponse('Error adding post gif', res, false, res.code || 400, res.message || 'Error adding post gif', res || 'POST_SERVICE_POCKETBASE_ERROR_UPLOADING_POST_GIF', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error adding post gif', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async generateImageUrl(record: any, filename: string) {
    return this.pb.getFileUrl(record, filename);
  }

  async getAllPostMedia(postId: string) {
    try {
      const res = await this.pb.collection('postMedia').getList(1, 50, {
        filter: `post="${postId}"`
      });
      console.log({ res });
      if (res.items) {
        return new ServiceResponse('Post media fetched', res.items, true, 200, null, null, null);
      }
      return new ServiceResponse('Error fetching post media', null, false, 400, 'Error getting post media', 'POST_SERVICE_POCKETBASE_ERROR_FETCHING_POST_MEDIA', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting post media', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async deletePBResource(collection: string, resourceId: string) {
    try {
      const res = await this.pb.collection(collection).delete(resourceId);
      console.log({ res });
      if (!res) {
        return new ServiceResponse('Resource deleted', res, true, 200, null, null, null);
      }
      return new ServiceResponse('Error deleting resource', null, false, res.code || 400, res.message || 'Error deleting resource', res || 'POST_SERVICE_POCKETBASE_ERROR_DELETING_RESOURCE', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error deleting post media', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async deleteMultipleRecords(collection: string, recordIds: string[]) {
    const promises = recordIds.map((x) => this.pb.collection(collection).delete(x, {
      $autoCancel: false,
    }));
    return Promise.all(promises);
  }

  async updateRecordsInParallel(collection: string, recordIds: string[], updateData: any) {
    const promises = recordIds.map((x) => this.pb.collection(collection).update(x, updateData, {
      $autoCancel: false,
    }));
    return Promise.all(promises);
  }
}
