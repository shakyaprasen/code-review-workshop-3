export enum INCOMING_TOPICS {
  TEST_INCOMING_EVENT = 'bl.event.test.created',
}

export enum BROADCAST_TOPICS {
  DLX_LOGS = 'bl.event.dlx.logs',
  PUBLISH_EMAIL = 'bl.event.widgets.created',
  WIDGET_CREATED = 'bl.event.widget.created',
  WIDGET_UPDATED = 'bl.event.widget.updated',
  WIDGET_DELETED = 'bl.event.widget.deleted',
}
