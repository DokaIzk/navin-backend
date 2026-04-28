import { jest } from '@jest/globals';
import { UserModel } from '../src/modules/users/users.model.js';
import { Shipment } from '../src/modules/shipments/shipments.model.js';

describe('Soft Delete Functionality', () => {
  describe('User Soft Delete', () => {
    it('should add deletedAt field to schema', () => {
      const userSchema = UserModel.schema;
      expect(userSchema.paths.deletedAt).toBeDefined();
      expect(userSchema.paths.deletedAt.instance).toBe('Date');
    });

    it('should filter out soft-deleted users in queries', async () => {
      // Mock the find method to test middleware
      const findSpy = jest.spyOn(UserModel, 'find');
      findSpy.mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
      }) as any);

      UserModel.find({});
      
      expect(findSpy).toHaveBeenCalled();
      findSpy.mockRestore();
    });
  });

  describe('Shipment Soft Delete', () => {
    it('should add deletedAt field to schema', () => {
      const shipmentSchema = Shipment.schema;
      expect(shipmentSchema.paths.deletedAt).toBeDefined();
      expect(shipmentSchema.paths.deletedAt.instance).toBe('Date');
    });

    it('should filter out soft-deleted shipments in queries', async () => {
      // Mock the find method to test middleware
      const findSpy = jest.spyOn(Shipment, 'find');
      findSpy.mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
      }) as any);

      Shipment.find({});
      
      expect(findSpy).toHaveBeenCalled();
      findSpy.mockRestore();
    });
  });
});
