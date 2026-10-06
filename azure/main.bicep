@description('Globally unique site name.')
param siteName string
@description('Globally unique storage account name: lowercase letters and numbers, 3–24 characters.')
param storageName string
param location string = 'westeurope'

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
 name: storageName
 location: location
 sku: { name: 'Standard_LRS' }
 kind: 'StorageV2'
 properties: {
  allowBlobPublicAccess: false
  supportsHttpsTrafficOnly: true
  minimumTlsVersion: 'TLS1_2'
 }
}
resource blobs 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
 parent: storage
 name: 'default'
 properties: {
  deleteRetentionPolicy: { enabled: true, days: 7 }
  containerDeleteRetentionPolicy: { enabled: true, days: 7 }
  isVersioningEnabled: true
 }
}
resource container 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
 parent: blobs
 name: 'wedding-content'
 properties: { publicAccess: 'None' }
}
resource site 'Microsoft.Web/staticSites@2022-09-01' = {
 name: siteName
 location: location
 sku: { name: 'Free', tier: 'Free' }
 properties: {}
}
resource settings 'Microsoft.Web/staticSites/config@2022-09-01' = {
 parent: site
 name: 'appsettings'
 properties: {
  PHOTO_STORAGE_CONNECTION_STRING: 'DefaultEndpointsProtocol=https;AccountName=${storage.name};AccountKey=${storage.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
  PHOTO_STORAGE_CONTAINER: container.name
 }
}
output website string = 'https://${site.properties.defaultHostname}'
