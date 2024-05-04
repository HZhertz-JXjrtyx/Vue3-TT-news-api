function validateSchemaJoi(method, schema) {
  async function validateSchema(ctx, next) {
    let data = undefined
    if (method === 'get' || method === 'delete') {
      data = await ctx.request.query
    } else {
      data = await ctx.request.body
    }
    console.log('获得data', data)
    const { error } = schema.validate(data)
    if (error) {
      ctx.body = error
      return
    } else {
      await next()
    }
  }
  return validateSchema
}

export default validateSchemaJoi
