import { forwardTo } from 'prisma-binding'

export const QueryForwards = {
  post: forwardTo('db'),
  posts: forwardTo('db'),
  user: forwardTo('db'),
  users: forwardTo('db'),
}

export const MutationForwards = {
  createPost: forwardTo('db'),
  updatePost: forwardTo('db'),
  deletePost: forwardTo('db'),
  updateManyPosts: forwardTo('db'),
  deleteManyPosts: forwardTo('db'),
  updateUser: forwardTo('db'),
  deleteUser: forwardTo('db'),
}

export const SubscriptionForwards = {
  post: forwardTo('db'),
}
