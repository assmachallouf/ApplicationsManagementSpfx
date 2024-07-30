import * as React from 'react';
import styles from './NewApplication.module.scss';
import type { INewApplicationProps } from './INewApplicationProps';
import { getSP } from '../../../pnpjsConfig';
import { Category } from '../../../Interfaces';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
import { Toolbar } from '@pnp/spfx-controls-react/lib/Toolbar';

interface INewApplicationState {
  title: string;
  description: string;
  link: string;
  picture: string;
  dateOfPosting: string;
  version: string;
  file: File | null;
  categories: Category[];
  selectedCategory: number;
  showModal: boolean;
  modalMessage: string;
  modalError: boolean;
}

export default class NewApplication extends React.Component<INewApplicationProps, INewApplicationState> {
  constructor(props: INewApplicationProps) {
    super(props);
    this.state = {
      title: '',
      description: '',
      link: '',
      picture: '',
      dateOfPosting: '',
      version: '',
      file: null,
      categories: [],
      selectedCategory: 0,
      showModal: false,
      modalMessage: '',
      modalError: false,
    };
  }

  public componentDidMount(): void {
    this.getCategories();
  }

  private async getCategories(): Promise<void> {
    try {
      let _sp = getSP(this.props.context);
      const items = await _sp.web.lists.getByTitle('Category').items();
      console.log("categories", items);
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

  private handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    this.setState({ [name]: value } as unknown as Pick<INewApplicationState, keyof INewApplicationState>);
  }

  private handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    this.setState({ file });
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.setState({ picture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  private handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { title, description, link, file, version ,selectedCategory} = this.state;
    const formData = {
      Title: title,
      Description: description,
      Link: link,
      Version: version, 
      IdCategoryId: selectedCategory
    };
    console.log('formData', formData);
    try {
      const LIST_NAME = 'Application';
      let _sp = getSP(this.props.context);
      const addedItem = await _sp.web.lists.getByTitle(LIST_NAME).items.add(formData);
      console.log('added item', addedItem);

      if (file) {
        await _sp.web.lists.getByTitle(LIST_NAME).items.getById(addedItem.Id).attachmentFiles.add(file.name, file);
      }
      console.log('Item added successfully');
      this.setState({ 
        showModal: true, 
        modalMessage: 'Application added successfully.', 
        modalError: false 
      });
    } catch (error) {
      console.error('Error adding item:', error);
      this.setState({ 
        showModal: true, 
        modalMessage: 'Error adding the application.', 
        modalError: true 
      });
    }
  }

  private handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      this.setState({ file });
      const reader = new FileReader();
      reader.onload = () => {
        this.setState({ picture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  private handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }

  private handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }

  private closeModal = () => {
    this.setState({ showModal: false });
  }

  public render(): React.ReactElement<INewApplicationProps> {
    const { title, description, link, picture, version, categories, selectedCategory, showModal, modalMessage, modalError } = this.state;

    return (
      <><Toolbar
      actionGroups={{
        'group1': {
          'action1': {
            title: 'Back to the list of the applications',
            iconName: 'Back',
            onClick: () => { window.location.href = 'https://yml6b.sharepoint.com/sites/ApplicationsManagement/SitePages/Home.aspx?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/manifests.js'; }
          }
        }
      }}
      // find={true}
    />
      <div>
        <form onSubmit={this.handleSubmit} className={styles.newApplicationForm}>
          <div>
            <label htmlFor="title">Titre</label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={this.handleInputChange}
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="link">Lien</label>
            <input
              type="text"
              id="link"
              name="link"
              value={link}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="version">Version</label>
            <input
              type="text"
              id="version"
              name="version"
              value={version}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="category">Catégorie</label>
            <select
              id="category"
              name="selectedCategory"
              value={selectedCategory}
              onChange={this.handleInputChange}
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.title}</option>
              ))}
            </select>
          </div>
          <div
            id="picture-dropzone"
            onDrop={this.handleDrop}
            onDragOver={this.handleDragOver}
            onDragLeave={this.handleDragLeave}
            style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}
          >
            {picture ? (
              <img src={picture} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
            ) : (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ margin: 0 }}>Faites glisser une image ici</p>
              </div>
            )}
            <input type="file" id="file" name="file" onChange={this.handleFileChange} style={{ display: 'none' }} />
          </div>
          {/* <div>
            <label htmlFor="dateOfPosting">Date de Publication</label>
            <input
              type="date"
              id="dateOfPosting"
              name="dateOfPosting"
              value={dateOfPosting}
              onChange={this.handleInputChange}
              required
            />
          </div> */}
          <button type="submit">Soumettre</button>
        </form>

        {showModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <p>{modalMessage}</p>
              {modalError ? (
                <div>
                  <button onClick={this.closeModal}>Try Again</button>
                  <button onClick={() => window.location.href = 'https://yml6b.sharepoint.com/sites/ApplicationsManagement/SitePages/Home.aspx?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/manifests.js'}>Back to List</button>
                  </div>
              ) : (
                <button onClick={() => window.location.href = 'https://yml6b.sharepoint.com/sites/ApplicationsManagement/SitePages/Home.aspx?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/manifests.js'}>Back to List</button>
              )}
            </div>
          </div>
        )}
        
      </div>
      </>
    );
  }
}