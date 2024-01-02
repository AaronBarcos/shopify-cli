import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs'

const data: ReferenceEntityTemplateSchema = {
  name: 'webhook trigger',
  description: `
  Triggers the delivery of a sample Admin API event topic payload to a designated address.

  You should use this command to experiment with webhooks, to initially test your webhook configuration, or for unit testing. However, to test your webhook configuration from end to end, you should always trigger webhooks by performing the related action in Shopify.

  Because most webhook deliveries use remote endpoints, you can trigger the command from any directory where you can use Shopify CLI, and send the webhook to any of the supported endpoint types. For example, you can run the command from your app's local directory, but send the webhook to a staging environment endpoint.

  To learn more about using webhooks in a Shopify app, refer to [Webhooks overview](https://shopify.dev/docs/apps/webhooks).

  ### Limitations

  - Webhooks triggered using this method always have the same payload, so they can't be used to test scenarios that differ based on the payload contents.
  - Webhooks triggered using this method aren't retried when they fail.
  - Trigger requests are rate-limited using the Partner API rate limit.
  - You can't use this method to validate your API webhook subscriptions.
  `,
  overviewPreviewDescription: 'Trigger delivery of a sample webhook topic payload to a designated address.',
  type: 'command',
  isVisualComponent: false,
  defaultExample: {
    codeblock: {
      tabs: [
        {
          title: 'webhook trigger',
          code: './examples/webhook-trigger.example.sh',
          language: 'bash',
        },
      ],
      title: 'webhook trigger',
    },
  },
  definitions: [
    {
      title: 'webhook trigger',
      description: 'The following flags are available for the `webhook trigger` command:',
      type: 'webhooktrigger',
    },
  ],
  category: 'Commands',
  subCategory: 'webhook',
  related: [
  ],
}

export default data