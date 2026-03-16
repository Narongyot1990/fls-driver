import mongoose, { Schema, Document, Model } from 'mongoose';

export const TASK_BRANCH_CODES = ['AYA', 'CBI', 'KSN', 'RA2', 'BBT'] as const;
export const TASK_STATUSES = ['active', 'closed'] as const;

export interface ITaskQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  hint?: string;
}

export interface ITaskSubmission {
  userId: mongoose.Types.ObjectId;
  answers: number[];
  score: number;
  total: number;
  submittedAt: Date;
}

export interface ITask extends Document {
  title: string;
  description: string;
  category: string;
  branches: Array<(typeof TASK_BRANCH_CODES)[number]>;
  questions: ITaskQuestion[];
  submissions: ITaskSubmission[];
  deadline?: Date;
  status: (typeof TASK_STATUSES)[number];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskQuestionSchema = new Schema<ITaskQuestion>(
  {
    question: { type: String, required: true, trim: true, minlength: 5, maxlength: 500 },
    options: {
      type: [{ type: String, required: true, trim: true, maxlength: 300 }],
      required: true,
      validate: {
        validator: (options: string[]) => Array.isArray(options) && options.length >= 2,
        message: 'Each question must have at least two options',
      },
    },
    correctIndex: { type: Number, required: true, min: 0 },
    hint: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const TaskSubmissionSchema = new Schema<ITaskSubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: {
      type: [{ type: Number, min: 0 }],
      default: [],
    },
    score: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    description: { type: String, default: '', trim: true, maxlength: 2000 },
    category: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    branches: {
      type: [{ type: String, enum: TASK_BRANCH_CODES }],
      default: [],
    },
    questions: {
      type: [TaskQuestionSchema],
      required: true,
      validate: {
        validator: (questions: ITaskQuestion[]) => Array.isArray(questions) && questions.length > 0,
        message: 'A task must include at least one question',
      },
    },
    submissions: { type: [TaskSubmissionSchema], default: [] },
    deadline: { type: Date },
    status: { type: String, enum: TASK_STATUSES, default: 'active' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

TaskSchema.pre('validate', function validateTaskModel(next) {
  for (const question of this.questions) {
    if (question.correctIndex >= question.options.length) {
      return next(new Error(`Question correctIndex out of range: "${question.question}"`));
    }
  }

  const seenSubmitters = new Set<string>();
  for (const submission of this.submissions) {
    const submitterId = submission.userId.toString();
    if (seenSubmitters.has(submitterId)) {
      return next(new Error('Duplicate submissions for the same user are not allowed'));
    }
    seenSubmitters.add(submitterId);

    if (submission.total !== this.questions.length) {
      return next(new Error('Submission total must match the number of task questions'));
    }

    if (submission.answers.length > this.questions.length) {
      return next(new Error('Submission answers exceed the number of task questions'));
    }

    if (submission.score > submission.total) {
      return next(new Error('Submission score cannot exceed submission total'));
    }
  }

  next();
});

TaskSchema.index({ status: 1, createdAt: -1 });
TaskSchema.index({ branches: 1, status: 1, createdAt: -1 });
TaskSchema.index({ category: 1, status: 1, createdAt: -1 });
TaskSchema.index({ deadline: 1, status: 1 });
TaskSchema.index({ 'submissions.userId': 1 });

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
