import { ServiceResponse } from '@cribplug/common';
import 'cross-fetch/polyfill';

// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-unresolved
const PocketBase = require('pocketbase/cjs');

export default class PBService {
  pb: any;

  constructor(pbUrl: string) {
    this.pb = new PocketBase(pbUrl);
  }

  async getUserById(userId: string) {
    try {
      const res = await this.pb.collection('users').getOne(userId);
      console.log({ res });
      if (res) {
        return new ServiceResponse('User found', res, true, 200, null, null, null);
      }
      return new ServiceResponse('User not found', res, false, 404, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error finding user', null, false, 500, error.message, error, 'Check logs and database');
    }
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

  async checkAuth() {
    console.log({
      isValid: this.pb.authStore.isValid,
      model: this.pb.authStore.model,
      token: this.pb.authStore.token
    });
    return this.pb.authStore.isValid;
  }

  async updateProfileImage(userId: string, imageData: any) {
    try {
      const res = await this.pb.collection('users').update(userId, imageData);
      console.log({ res });
      if (!res.code) {
        return new ServiceResponse('User profile image updated', res, true, 200, null, null, null);
      }
      return new ServiceResponse('Error updating profile image', res, false, 400, 'Error updating profile image', 'PROFILE_SERVICE_PROFILE_IMAGE_UPDATE_ERROR', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error updating profile image', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async updateProfileWallpaper(userId: string, imageData: any) {
    try {
      const res = await this.pb.collection('users').update(userId, imageData);
      console.log({ res });
      if (!res.code) {
        return new ServiceResponse('User profile wallpaper updated', res, true, 200, null, null, null);
      }
      return new ServiceResponse('Error updating profile wallpaper', res, false, 400, 'Error updating profile image', 'PROFILE_SERVICE_PROFILE_WALLPAPER_UPDATE_ERROR', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error updating profile wallpaper', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async generateImageUrl(record: any, filename: string) {
    return this.pb.getFileUrl(record, filename);
  }
}
