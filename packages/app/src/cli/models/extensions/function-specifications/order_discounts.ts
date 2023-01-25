import {createFunctionSpecification} from '../functions.js'

const spec = createFunctionSpecification({
  identifier: 'order_discounts',
  externalIdentifier: 'order_discount',
  externalName: 'Function - Order discount',
  helpURL: 'https://shopify.dev/apps/subscriptions/discounts',
  templateURL: 'https://github.com/Shopify/function-examples',
  templatePath: (lang) => `discounts/${lang}/order-discounts/default`,
})

export default spec
