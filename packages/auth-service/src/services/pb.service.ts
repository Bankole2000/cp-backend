import { ServiceResponse } from '@cribplug/common';
import 'cross-fetch/polyfill';

// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-unresolved
const PocketBase = require('pocketbase/cjs');

export default class PBService {
  pb: any;

  constructor(pbUrl: string) {
    this.pb = new PocketBase(pbUrl);
  }

  async findUserById(userId: string) {
    const filter = `id="${userId}"`;
    console.log({ filter });
    try {
      const res = await this.pb.collection('users').getFirstListItem(filter);
      console.log({ res });
      if (res) {
        return new ServiceResponse('User found', res, true, 200, null, null, null);
      }
      return new ServiceResponse('User not found', null, false, 404, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error finding user', null, false, 500, error.message, error, 'Check logs and database');
    }
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

  async createUser(userData: any) {
    try {
      const res = await this.pb.collection('users').create(userData);
      console.log({ res });
      if (res) {
        return new ServiceResponse('User created', res, true, 200, null, null, null);
      }
      return new ServiceResponse('User not created', res, false, 400, 'Error creating user in Pocketbase', null, null);
    } catch (error: any) {
      console.log({ error, data: error.data });
      return new ServiceResponse('Error creating user', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async confirmVerification(pbToken: string) {
    try {
      await this.pb.collection('users').confirmVerification(pbToken);
    } catch (error: any) {
      console.log({ error });
    }
  }

  async confirmPasswordReset(pbToken: string, newPassword: string, confirmPassword: string) {
    try {
      await this.pb.collection('users').confirmPasswordReset(pbToken, newPassword, confirmPassword);
    } catch (error: any) {
      console.log({ error });
    }
  }

  async authenticateUser(username: string, password: string) {
    console.log({ username, password });
    try {
      const res = await this.pb.collection('users').authWithPassword(username, password);
      console.log({ res });
      if (res.token && res.record) {
        return new ServiceResponse('User authenticated', res, true, 200, null, null, null);
      }
      return new ServiceResponse('User not authenticated', null, false, 400, 'Error authenticating user in Pocketbase', null, null);
    } catch (error: any) {
      console.log({ error, data: error.data });
      return new ServiceResponse('Error authenticating user', null, false, 500, error.message, error, 'Check logs and database');
    }
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

  async logout() {
    await this.pb.authStore.clear();
  }

  async updateUser(userId: string, userData: any) {
    try {
      const res = await this.pb.collection('users').update(userId, userData);
      console.log({ res });
      if (res) {
        return new ServiceResponse('User updated', res, true, 200, null, null, null);
      }
      return new ServiceResponse('User not updated', null, false, 400, 'Error updating user in Pocketbase', null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error updating user', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async deleteUser(pbUserId: string) {
    try {
      const result = await this.pb.collection('users').delete(pbUserId);
      console.log({ result });
    } catch (error: any) {
      console.log({ error });
    }
  }

  async saveAuth(token: any, model: any) {
    console.log({ token, model });
    try {
      const saveResult = await this.pb.authStore.save(token, model);
      let res;
      if (!this.checkAuth()) {
        res = await this.pb.collection('users').authRefresh();
      } else {
        res = { token, record: model };
      }
      console.log({ res, saveResult });
      return res;
    } catch (error: any) {
      console.log({ error });
      return null;
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
}
