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
}
