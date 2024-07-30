$siteUrl = "https://yml6b.sharepoint.com/sites/ApplicationsManagement"
$communicationSiteTitle = "ApplicationsManagement"
$communicationSiteDescription = "Site to manage Alight Applications including all the details concerning them"

# Connect to SharePoint Online
#Connect-PnPOnline -Url $siteUrl -UseWebLogin

# Create the Communication Site
#New-PnPCommunicationSite -Title $communicationSiteTitle -Description $communicationSiteDescription

# Reconnect to the newly created site
Connect-PnPOnline -Url $siteUrl -UseWebLogin

# Create the "Application" list
$appListTitle = "Application"
#Add-PnPList -Title $appListTitle -Template GenericList -Description "List of Applications"

# Add fields to the "Application" list
Add-PnPField -List $appListTitle -DisplayName "Title" -InternalName "Title" -Type Text
Add-PnPField -List $appListTitle -DisplayName "Description" -InternalName "Description" -Type Text
Add-PnPField -List $appListTitle -DisplayName "Version" -InternalName "Version" -Type Text
Add-PnPField -List $appListTitle -DisplayName "Link" -InternalName "Link" -Type URL
Add-PnPField -List $appListTitle -DisplayName "Date of Posting" -InternalName "DateOfPosting" -Type DateTime
# Add-PnPField -List $appListTitle -DisplayName "Logo" -InternalName "Logo" -Type URL

# Create the "Comment" list
$commentListTitle = "Comment"
#Add-PnPList -Title $commentListTitle -Template GenericList -Description "List of Comments"

# Add fields to the "Comment" list
Add-PnPField -List $commentListTitle -DisplayName "Content" -InternalName "Content" -Type Text
Add-PnPField -List $commentListTitle -DisplayName "Date of Posting" -InternalName "DateOfPosting" -Type DateTime

# Create a lookup field in the "Comment" list that links to the "Application" list
Add-PnPField -List $commentListTitle -DisplayName "Application" -InternalName "ApplicationLookup" -Type Lookup -LookupList $appListTitle -LookupField "Title"

# Create the "Category" list
$categoryListTitle = "Category"
#Add-PnPList -Title $categoryListTitle -Template GenericList -Description "List of Categories"

# Add fields to the "Category" list
Add-PnPField -List $categoryListTitle -DisplayName "Title" -InternalName "Title" -Type Text
Add-PnPField -List $categoryListTitle -DisplayName "Description" -InternalName "Description" -Type Text

# Create a lookup field in the "Application" list that links to the "Category" list
Add-PnPField -List $appListTitle -DisplayName "Category" -InternalName "CategoryLookup" -Type Lookup -LookupList $categoryListTitle -LookupField "Title"

Write-Host "Lists 'Application', 'Comment', and 'Category' created successfully with required fields and foreign key relationships."