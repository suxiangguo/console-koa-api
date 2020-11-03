import Koa from 'koa'
import JWT from 'koa-jwt'
import cors from 'koa2-cors'
import compose from 'koa-compose'
import bodyParser from 'koa-bodyparser'

import routes from './routes/router'
import config from './config/index'
import errorHandle from './common/errorHandle'

const app = new Koa()


/**
 * 定义公共路径，不需要jwt鉴权
 */
const jwt = JWT({ secret: config.JWT_SECRET }).unless({ path: [/^\/public/, /^\/login/] })

/**
 * 使用koa-compose集成中间件
 */
const middleware = compose([
  bodyParser(),
  cors(),
  errorHandle,
  jwt
])
app.use(middleware)
app.use(routes())
app.listen(3000)