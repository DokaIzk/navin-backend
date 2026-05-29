import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { isoDatePlugin } from '../../shared/plugins/isoDatePlugin.js';
import { IOrganization, OrganizationType, IUser, UserRole } from '../../shared/types/user.js';

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: Object.values(OrganizationType), required: true },
  },
  { timestamps: true }
);

OrganizationSchema.plugin(isoDatePlugin);

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    walletAddress: { type: String, required: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const result = ret as any;
        delete result.passwordHash;
        return result;
      },
    },
  }
);

UserSchema.plugin(isoDatePlugin);

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash')) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

// Override toJSON to hide passwordHash
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

// Soft delete middleware
UserSchema.pre(['find', 'findOne', 'findOneAndUpdate', 'countDocuments'], function () {
  this.where({ deletedAt: null });
});

UserSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { deletedAt: null } });
});

export const OrganizationModel = mongoose.model<IOrganization>('Organization', OrganizationSchema);
export { OrganizationType };

export const UserModel = mongoose.model<IUser>('User', UserSchema);
export { UserRole };
