# Google Cloud Function Access

This action is able to access a protected Google Cloud Function by using a provided service account.

## Inputs

### `service-json-path`

**Required** The path to the service account json. Default `"gcloud.json"`.

### `url`

**Required** The url of the cloud function.

### `method`

The method to use for the request. Default `"GET"`.

### `body`

The body of the request. Default `""`.

## Example usage

```yaml
uses: stikkyapp/google-cloud-function-access@v2
with:
  service-json-path: 'gcloud.json'
  url: 'https://test.example.org/get'
  method: 'POST'
  body: '{"foo":"bar"}'
```