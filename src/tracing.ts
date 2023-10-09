import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import * as process from 'process';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { KafkaJsInstrumentation } from 'opentelemetry-instrumentation-kafkajs';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ElasticsearchInstrumentation } from 'opentelemetry-instrumentation-elasticsearch';
import * as opentelemetry from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';

const exporter = new JaegerExporter({
  endpoint:
    process.env.NODE_ENV === 'docker-compose'
      ? 'http://jaeger:14268/api/traces'
      : '',
});

const oltpEndpoint = `http://${process.env.OTEL_COL_OLTP_ENDPOINT}:4318/v1/traces`;

const traceExporter = new OTLPTraceExporter({
  url: oltpEndpoint,
});

const otelSdk = new opentelemetry.NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'bl-ms-reviews',
  }),
  spanProcessor:
    process.env.NODE_ENV === 'docker-compose'
      ? (new SimpleSpanProcessor(exporter) as SpanProcessor)
      : (new BatchSpanProcessor(traceExporter) as SpanProcessor),

  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook(req) {
          const isReadyURL = !!req.url.includes('/ready');
          return isReadyURL;
        },
      },
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-dns': {
        enabled: false,
      },
    }),
    new ElasticsearchInstrumentation(),
    new KafkaJsInstrumentation({}),
  ],
});

otelSdk.start();

// gracefully shutdown the SDK on process exit
process.on('SIGTERM', () => {
  otelSdk
    .shutdown()
    .then(
      () => console.log('SDK shutdown succesfully.'),
      (err: any) => console.log('Error when shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});

export default otelSdk;
