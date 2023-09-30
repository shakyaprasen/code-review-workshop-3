export enum INCOMING_TOPICS {
  TEST_INCOMING_EVENT = 'bl.event.test.created',
}

export enum BROADCAST_TOPICS {
  DLX_LOGS = 'bl.event.dlx.logs',
  PUBLISH_EMAIL = 'bl.event.reviews.created',
  WIDGET_CREATED = 'bl.event.review.created',
  WIDGET_UPDATED = 'bl.event.review.updated',
  WIDGET_DELETED = 'bl.event.review.deleted',
}
