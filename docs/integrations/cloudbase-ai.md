# CloudBase AI integration

This project keeps AI credentials on the API server. The mini program only calls
our `/api/v1/xuxu/chat` and `/api/v1/food-recognition/analyze` endpoints.

## Choose one authentication path

### Growth Plan (recommended for `hy3`)

Use the CloudBase Node SDK with server-only Tencent credentials:

```dotenv
CLOUDBASE_ENV_ID=tl-d2ghzbl1p09ccaae3
TENCENTCLOUD_SECRET_ID=AKID...
TENCENTCLOUD_SECRET_KEY=...
CLOUDBASE_AI_TEXT_MODEL=hy3
```

The API adapter loads `@cloudbase/node-sdk` when this mode is enabled. Add the
package to the API workspace before deploying this mode:

```powershell
npm install --workspace apps/api --save @cloudbase/node-sdk
```

The API creates `app.ai().createModel('cloudbase')` and invokes the model from
the server. The Tencent secret pair is not sent to the mini program.

### CloudBase AI Gateway

Use this only with an API key created in the CloudBase AI console after a model
provider has been configured there:

```dotenv
CLOUDBASE_AI_BASE_URL=https://tl-d2ghzbl1p09ccaae3.api.tcloudbasegateway.com/v1/ai/cloudbase
CLOUDBASE_AI_API_KEY=cloudbase-gateway-key
```

Requests use `Authorization: Bearer <key>` and the OpenAI-compatible
`/chat/completions` path. A provider key copied from the GLM platform is not a
CloudBase Gateway key and will return HTTP 401.

## Food image recognition

The local setup uses the cheaper `glm-4v-flash` vision model with the GLM
OpenAI-compatible endpoint:

```dotenv
CLOUDBASE_AI_VISION_MODEL=glm-4v-flash
CLOUDBASE_AI_VISION_BASE_URL=https://open.bigmodel.cn/api/paas/v4
CLOUDBASE_AI_VISION_API_KEY=your-glm-provider-key
```

The API stores only a SHA-256 image hash for audit; the original image is not
persisted. Candidates include estimated grams, calories, protein, fat, and
carbohydrates. A meal entry is created only after the user confirms a candidate
and serving size.

## Verification

1. Start PostgreSQL and Redis, then run the API.
2. Check `GET /api/v1/health`.
3. Call `/api/v1/xuxu/chat` with a development bearer token.
4. Call `/api/v1/food-recognition/analyze` with a real image Base64 payload.
5. Confirm a candidate through `/api/v1/food-recognition/confirm` and verify the
   resulting meal entry in the user's records.

Never commit `.env`, `glmapikey.txt`, Tencent secrets, or provider keys.
