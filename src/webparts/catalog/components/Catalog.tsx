import * as React from 'react';
import type { ICatalogProps } from './ICatalogProps';
import { getSP } from '../../../pnpjsConfig';
import { SPFI } from '@pnp/sp';
import { Category, Solution } from '../../../Interfaces';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { GridLayout } from "@pnp/spfx-controls-react/lib/GridLayout";
import { ISize, IDocumentCardPreviewProps, ImageFit, DocumentCard, DocumentCardType, DocumentCardPreview, DocumentCardLocation, DocumentCardDetails, DocumentCardTitle, DocumentCardActivity } from '@fluentui/react';
import { IconButton } from '@fluentui/react/lib/Button';
import { mergeStyles } from '@fluentui/react/lib/Styling';
import "@pnp/sp/attachments";
import { Toolbar } from '@pnp/spfx-controls-react/lib/Toolbar';
import { Dialog, DialogFooter, DialogType, DefaultButton, PrimaryButton, TextField, Dropdown, IDropdownOption } from '@fluentui/react';
//import { useNavigate } from 'react-router-dom';
// import {  PeoplePicker } from "@pnp/spfx-controls-react/lib/PeoplePicker";

interface ICatalogState {
  solutions: Solution[];
  showModal: boolean;
  selectedApplication: Solution | null;
  categories: Category[];
}

export default class Catalog extends React.Component<ICatalogProps, ICatalogState> {
  constructor(props: ICatalogProps) {
    super(props);
    this.state = {
      solutions: [],
      showModal: false,
      selectedApplication: null,
      categories: []
    };
  }

  public componentDidMount(): void {
    
    this.getSolutions();
    this.getCategories();
  }

  private async getCategories(): Promise<void> {
    try {
      let _sp = getSP(this.props.context);
      const items = await _sp.web.lists.getByTitle('Category').items();
      const categories = items.map((item: any) => ({
        id: item.Id,
        title: item.Title,
        description: item.Description
      }));
      this.setState({ categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  private async getSolutions(): Promise<void> {
    const LIST_NAME = 'Application';
    let _sp: SPFI = getSP(this.props.context);
    const items = await _sp.web.lists.getByTitle(LIST_NAME).items();

    const solutions = await Promise.all(items.map(async (item: any) => {
      const attachmentFiles = await this.fetchAttachments(item.Id);
      return {
        id: item.Id,
        title: item.Title,
        description: item.Description,
        version: item.Version,
        link: item.Link,
        dateOfPosting: item.DateOfPosting,
        attachment: attachmentFiles.length > 0 ? attachmentFiles[0].ServerRelativeUrl : null,
        idCategory: item.IdCategory
      };
    }));
    this.setState({ solutions });
  }

  private async fetchAttachments(itemId: number): Promise<any[]> {
    try {
      let _sp: SPFI = getSP(this.props.context);
      const attachments = await _sp.web.lists.getByTitle("Application").items.getById(itemId).attachmentFiles();
      return attachments;
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  }

  private handleEdit = (id: number) => {
    const selectedApplication = this.state.solutions.find(solution => solution.id === id) || null;
    if (selectedApplication) {
      this.setState({ selectedApplication, showModal: true });
    }
  }

  private handleDelete = (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (confirmed) {
      this.deleteItem(id);
    }
  }

  private async deleteItem(id: number): Promise<void> {
    try {
      let _sp: SPFI = getSP(this.props.context);
      await _sp.web.lists.getByTitle("Application").items.getById(id).delete();
      this.setState((prevState) => ({
        solutions: prevState.solutions.filter((solution) => solution.id !== id)
      }));
      console.log(`Item with id: ${id} deleted`);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  private closeModal = () => {
    this.setState({ showModal: false, selectedApplication: null });
  }

  private updateApplication = async () => {
    if (!this.state.selectedApplication) return;

    const { id, title, description, link, version, idCategory } = this.state.selectedApplication;
    const updatedData = { Title: title, Description: description, Link: link, Version: version, IdCategoryId: idCategory };

    try {
      let _sp: SPFI = getSP(this.props.context);
      await _sp.web.lists.getByTitle("Application").items.getById(id).update(updatedData);
      this.setState(prevState => ({
        solutions: prevState.solutions.map(solution => solution.id === id ? { ...solution, ...updatedData } : solution),
        showModal: false,
        selectedApplication: null
      }));
      console.log('Application updated successfully');
    } catch (error) {
      console.error('Error updating application:', error);
    }
  }

  private _onRenderGridItem = (item: any, finalSize: ISize, isCompact: boolean): JSX.Element => {
    const previewProps: IDocumentCardPreviewProps = {
      previewImages: [
        {
          previewImageSrc: item.attachment,
          imageFit: ImageFit.cover,
          height: 130
        }
      ]
    };

    const iconButtonClass = mergeStyles({
      color: '#EF7C2B',
      selectors: {
        ':hover': {
          color: '#EF7C2B',
        },
        ':active': {
          color: '#EF7C2B',
        },
      },
    });

    const handleEditClick = (event: React.MouseEvent<unknown>): void => {
      event.stopPropagation(); // Prevents click event from bubbling up to the DocumentCard
      this.handleEdit(item.id);
    };

    const handleDeleteClick = (event: React.MouseEvent<unknown>): void => {
      event.stopPropagation(); // Prevents click event from bubbling up to the DocumentCard
      this.handleDelete(item.id);
    };
   // const navigate = useNavigate();

    
  //   const openApplicationDetails = () => {
  //  //   navigate('https://yml6b.sharepoint.com/sites/ApplicationsManagement/SitePages/Application-Details.aspx?id='+item.id+'&debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/manifests.js');
  //   window.location.href = `https://yml6b.sharepoint.com/sites/ApplicationsManagement/SitePages/Application-Details.aspx?id=${item.id}&debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/manifests.js`;
  //   };


  const openApplicationDetails = () => {
    // location.assign(
    //   `https://yml6b.sharepoint.com/sites/ApplicationsManagement/SitePages/Application-Details.aspx?id=${item.id}`
    // );
    window.location.href=(`https://yml6b.sharepoint.com/sites/ApplicationsManagement/SitePages/Application-Details.aspx?itemID=${item.id}`)
  };
  
  
    return (
      <div
        data-is-focusable={true}
        role="listitem"
        aria-label={item.title}
      >
        <DocumentCard
          type={isCompact ? DocumentCardType.compact : DocumentCardType.normal}
          onClick={openApplicationDetails}
        >
          <DocumentCardPreview {...previewProps} />
          {!isCompact && <DocumentCardLocation location={item.location} />}
          <DocumentCardDetails>
            <DocumentCardTitle
              title={item.title}
              shouldTruncate={true}
            />
            <DocumentCardActivity
              activity={`Posted on ${new Date(item.dateOfPosting).toLocaleDateString()}`}
              people={[{ name: 'Admin', profileImageSrc: item.profileImageSrc }]}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <IconButton
                iconProps={{ iconName: 'Edit' }}
                title="Edit"
                ariaLabel="Edit"
                className={iconButtonClass}
                onClick={handleEditClick}
              />
              <IconButton
                iconProps={{ iconName: 'Delete' }}
                title="Delete"
                ariaLabel="Delete"
                className={iconButtonClass}
                onClick={handleDeleteClick}
              />
            </div>
          </DocumentCardDetails>
        </DocumentCard>
      </div>
    );
  }
  // private _getPeoplePickerItems(items: any[]) {
  //   console.log('Items:', items);
  // }

  public render(): React.ReactElement<ICatalogProps> {
    const { showModal, selectedApplication, categories } = this.state;
    const categoryOptions: IDropdownOption[] = categories.map(category => ({
      key: category.id,
      text: category.title
  }));
  //   const peoplePickerContext: IPeoplePickerContext = {
  //     absoluteUrl: this.props.context.pageContext.web.absoluteUrl,
  //     msGraphClientFactory: this.props.context.msGraphClientFactory,
  //     spHttpClient: this.props.context.spHttpClient
  // };
  

    return (
      <>
      {/* <PeoplePicker
    context={this.props.context}
    titleText="People Picker"
   personSelectionLimit={3}
 groupName={""} // Leave this blank in case you want to filter from all users
     showtooltip={true}
    // required={true}
    // disabled={true}
    //searchTextLimit={5}
    //onChange={this._getPeoplePickerItems}
    //showHiddenInUI={false}
    //principalTypes={[PrincipalType.User]}
  //  resolveDelay={1000} 
    /> */}
    <h1></h1>
        <Toolbar
          actionGroups={{
            'group1': {
              'action1': {
                title: 'New Application',
                iconName: 'Add',
                onClick: () => { window.location.href = 'https://yml6b.sharepoint.com/sites/ApplicationsManagement/SitePages/New-Application.aspx?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/manifests.js'; }
              }
            }
          }}
          find={true}
        />

        <GridLayout
          ariaLabel="List of content, use right and left arrow keys to navigate, arrow down to access details."
          items={this.state.solutions}
          onRenderGridItem={this._onRenderGridItem}
        />

        {showModal && selectedApplication && (
          <Dialog
            hidden={!showModal}
            onDismiss={this.closeModal}
            dialogContentProps={{
              type: DialogType.largeHeader,
              title: 'Edit Application'
            }}
          >
            <TextField
              label="Title"
              value={selectedApplication.title}
              onChange={(e, newValue) => this.setState(prevState => ({
                selectedApplication: { ...prevState.selectedApplication!, title: newValue || '' }
              }))}
            />
            <TextField
              label="Description"
              multiline
              value={selectedApplication.description}
              onChange={(e, newValue) => this.setState(prevState => ({
                selectedApplication: { ...prevState.selectedApplication!, description: newValue || '' }
              }))}
            />
            <TextField
              label="Link"
              value={selectedApplication.link}
              onChange={(e, newValue) => this.setState(prevState => ({
                selectedApplication: { ...prevState.selectedApplication!, link: newValue || '' }
              }))}
            />
            <TextField
              label="Version"
              value={selectedApplication.version}
              onChange={(e, newValue) => this.setState(prevState => ({
                selectedApplication: { ...prevState.selectedApplication!, version: newValue || '' }
              }))}
            />

            <Dropdown
              label="Category"
              selectedKey={selectedApplication.idCategory}
              options={categoryOptions}
              onChange={(e, option) => this.setState(prevState => ({
                selectedApplication: { ...prevState.selectedApplication!, idCategory: option!.key as number }
              }))}
            />
            <DialogFooter>
              <PrimaryButton onClick={this.updateApplication} text="Save" />
              <DefaultButton onClick={this.closeModal} text="Cancel" />
            </DialogFooter>
          </Dialog>
        )}
      </>
    );
  }
}
