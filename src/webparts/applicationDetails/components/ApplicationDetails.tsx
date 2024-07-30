import * as React from 'react';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { getSP } from '../../../pnpjsConfig';
import { Solution } from '../../../Interfaces';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
import styles from './ApplicationDetails.module.scss';
import { IApplicationDetailsProps } from './IApplicationDetailsProps';
import { Toolbar } from '@pnp/spfx-controls-react/lib/Toolbar';

interface ICategory {
  title: string;
  description: string;
}
interface IApplicationDetailsState {
  application: Solution | null;
  loading: boolean;
  category: ICategory | null; 
}

export default class ApplicationDetails extends React.Component<IApplicationDetailsProps, IApplicationDetailsState> {
  constructor(props: IApplicationDetailsProps) {
    super(props);
    this.state = {
      application: null,
      loading: true,
      category: null
    };
  }

  public componentDidMount(): void {
    
    this.loadData();
  }

  public componentDidUpdate(prevProps: IApplicationDetailsProps): void {
    if (prevProps.id !== this.props.id) {
      this.loadData();
    }
  }

  private async loadData(): Promise<void> {
    this.setState({ loading: true }); // Start loading
    try {
      await this.getApplicationDetails(); // Wait for application details to load
      await this.getCategoryDetails(); // Then load category details
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.setState({ loading: false }); // Finish loading
    }
  }

  private async getApplicationDetails(): Promise<void> {
    const { context } = this.props;
    const id = this.getCurrentID();

    if (!id) {
      console.error('ID not found in URL');
      return;
    }

    try {
      let _sp = getSP(context);

      const item = await _sp.web.lists.getByTitle('Application').items.getById(parseInt(id))();
      console.log("item", item);

      const attachmentFiles = await this.fetchAttachments(item.Id);
      const application: Solution = {
        id: item.Id,
        title: item.Title,
        description: item.Description,
        version: item.Version,
        link: item.Link,
        dateOfPosting: item.DateOfPosting,
        attachment: attachmentFiles.length > 0 ? attachmentFiles[0] : null,
        idCategory: item.IdCategoryId
      };
      console.log(application);
      this.setState({ application });
      
    } catch (error) {
      console.error('Error fetching application details:', error);
    }
  }

  private async getCategoryDetails(): Promise<void> {
    const { context } = this.props;
    const { application } = this.state;

    if (!application) {
      console.error('Application not loaded yet');
      return;
    }

    try {
      let _sp = getSP(context);
      console.log("hi", application);
      const categoryItem = await _sp.web.lists.getByTitle('Category').items.getById(application.idCategory)();
      console.log("hello", categoryItem);

      const category: ICategory = {
        title: categoryItem.Title,
        description: categoryItem.Description
      };
      console.log(category);
      this.setState({ category });
    } catch (error) {
      console.error('Error fetching category details:', error);
    }
  }

  private getCurrentID = () => {
    const currentURL = window.location.href ;
    const urlObject = new URL(currentURL) ;
    return urlObject.searchParams.get('itemID') ;
  }

  // private getIdFromUrl(): number | null {
  //   const { context } = this.props;
  //   const currentUrl = context.pageContext.web.absoluteUrl + window.location.pathname + window.location.search;
  //   console.log(currentUrl);
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const idFromUrl = urlParams.get('id');

  //   if (idFromUrl) {
  //     return parseInt(idFromUrl);
  //   } else {
  //     console.warn('ID not found in URL');
  //     return null;
  //   }
  // }

  private async fetchAttachments(itemId: number): Promise<any[]> {
    try {
      let _sp = getSP(this.props.context);
      const attachments = await _sp.web.lists.getByTitle("Application").items.getById(itemId).attachmentFiles();
      return attachments;
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  }

  private renderAttachment(): JSX.Element | null {
    const { application } = this.state;

    if (!application || !application.attachment) return null;

    const { attachment } = application;

    // Check if the attachment is an image
    const isImage = 1; // Update this logic as needed

    if (!isImage) {
      return (
        <div>
          <button onClick={() => this.downloadAttachment(attachment)}>Download File</button>
        </div>
      );
    }

    // Render image if it's an image file
    const imageUrl = attachment.ServerRelativeUrl;
    console.log(attachment);

    return (
      <div className={styles.imageContainer}>
        <img src={imageUrl} className={styles.attachmentImage} />
      </div>
    );
  }

  private async downloadAttachment(attachment: any): Promise<void> {
    try {
      const fileContent = await attachment.file();
      const blob = new Blob([fileContent]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.FileName;
      a.click();
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  }

  public render(): React.ReactElement<IApplicationDetailsProps> {
    const { application, loading, category } = this.state;

    if (loading) {
      return <Spinner label="Loading application details..." />;
    }

    if (!application) {
      return <div>Application not found!</div>;
    }

    return (
      <>
        <Toolbar
          actionGroups={{
            'group1': {
              'action1': {
                title: 'Back to the list of the applications',
                iconName: 'Back',
                onClick: () => { window.location.href = 'https://yml6b.sharepoint.com/sites/ApplicationsManagement/SitePages/Home.aspx?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/manifests.js'; }
              }
            }
          }}
        />
        <div className={styles.applicationDetails}>
          {this.renderAttachment()}
          <div className={styles.applicationContainer}>
            <div className={styles.descriptionContainer}>
              <p className={styles.description}>{application.description}</p>
            </div>
            <div className={styles.infoContainer}>
              {category && (
                <div className={styles.categoryDetails}>
                  <h2>Category Details</h2>
                  <p>Title: {category.title}</p>
                  <p>Description: {category.description}</p>
                </div>
              )}
              <p>Version: {application.version}</p>
              <p>Link: <a href={application.link} target="_blank" rel="noopener noreferrer">{application.link}</a></p>
              <p>Posted on: {new Date(application.dateOfPosting).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </>
    );
  }
}
