import { auth } from './auth'
import { AuthPayload } from './AuthPayload'
import { MutationForwards, QueryForwards, SubscriptionForwards } from './forwards'
import { Query } from './Query'

export default {
  Query: {
    ...Query,
    ...QueryForwards,
  },
  Mutation: {
    ...auth,
    ...MutationForwards,
  },
  Subscription: SubscriptionForwards,
  AuthPayload,
}
