import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, required: true },
    locationName: { type: String, required: true },

    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },

    description: { type: String, required: true },

    reportedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      name: { type: String, required: true },
      email: { type: String }
    },
    state: { type: String, default: 'Rajasthan' },

    department: {
      type: String,
      enum: ['Unassigned', 'Road', 'Water', 'Sanitation', 'Electricity', 'Drainage', 'Police'],
      default: 'Unassigned'
    },

    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Escalated'],
      default: 'Pending'
    },
    image: { type: String },

  // --- NAYE FIELDS (Dynamic Interactions) ---
  likes: [{ type: String }], // Array of User IDs
  dislikes: [{ type: String }], // Array of User IDs
  comments: [{
    userId: { type: String },
    name: { type: String },
    text: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]

  },

  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;
