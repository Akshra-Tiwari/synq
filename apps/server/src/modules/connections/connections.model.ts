import mongoose, { Document, Schema } from 'mongoose';

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'removed';

export interface IConnection extends Document {
  _id:       mongoose.Types.ObjectId;
  requester: mongoose.Types.ObjectId;   // user who sent the request
  recipient: mongoose.Types.ObjectId;   // user who received it
  status:    ConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionSchema = new Schema<IConnection>(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type:    String,
      enum:    ['pending', 'accepted', 'rejected', 'removed'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

// One connection document per ordered pair — prevents duplicates at DB level
ConnectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
// Fast lookup for incoming requests
ConnectionSchema.index({ recipient: 1, status: 1, createdAt: -1 });
// Fast lookup for outgoing requests
ConnectionSchema.index({ requester: 1, status: 1, createdAt: -1 });

export const Connection = mongoose.model<IConnection>('Connection', ConnectionSchema);
