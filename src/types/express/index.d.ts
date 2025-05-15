declare module Express {
  export interface Request {
    user?: {
      _id: ObjectId,
      firstName: string,
      lastName: string,
      username: string,
      role: string
    };
  }
}