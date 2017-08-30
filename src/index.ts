import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export {
  Project,
  ProjectChange,
  Story,
  StoryChange,
  Member,
  Epic,
  EpicChange,
  StoryComment,
  Task,
  TaskChange,
  Workflow,
  StoryLinkChange,
  StoryLink,
  File,
  FileChange,
  LinkedFile,
  LinkedFileChange,
  RequestFactory,
  ID,
  Label,
  StoryType
} from './types';

import {
  Project,
  ProjectChange,
  Story,
  StoryChange,
  Member,
  Epic,
  EpicChange,
  StoryComment,
  Task,
  TaskChange,
  Workflow,
  StoryLinkChange,
  StoryLink,
  File,
  FileChange,
  LinkedFile,
  LinkedFileChange,
  RequestFactory,
  ID,
  Label,
  StoryType
} from './types';

const API_BASE_URL: string = 'https://api.clubhouse.io';
const API_VERSION: string = 'beta';

const parseResponse = (response: AxiosResponse): Promise<any> => {
  return response.data;
};

class TokenRequestFactory implements RequestFactory {

  private axios: AxiosInstance;

  constructor(token: string) {
    this.axios = axios.create({
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
      },
      params: {
        token: token
      }
    })
  }

  async makeRequest(url: string, method: string = 'GET', data?: object): Promise<any> {
    // while loop is used for transparent retry when rate limit reached.
    while (true) {
      try {
        return await this.axios.request({
          url,
          data,
          method
        });
      } catch (e) {
        if (e && e.response && e.response.status === 429) {
          console.warn(`clubhouse.io api rate limit reached while calling: ${e.config.method} ${e.config.url} - Retrying in 60 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 60000));
        } else {
          throw e;
        }
      }
    }
  }
}

/** */
export type ClientConfig = {
  baseURL: string,
  version: string,
};

const defaultConfig = {
  baseURL: API_BASE_URL,
  version: API_VERSION,
};

/**
 * @class Client
*/
export default class Client {
  baseURL: string;
  version: string;
  requestFactory: RequestFactory;

  constructor(
    { baseURL, version }: ClientConfig = defaultConfig,
    requestFactory: RequestFactory,
  ) {
    this.baseURL = baseURL;
    this.version = version;
    this.requestFactory = requestFactory;
  }
  /** */
  static create(token: string, options?: ClientConfig): Client {
    return new Client(options || defaultConfig, new TokenRequestFactory(token));
  }

  generateUrl(uri: string): string {
    return `${this.baseURL}/api/${this.version}/${uri}`;
  }

  listResource<ResponseType>(uri: string): Promise<Array<ResponseType>> {
    const URL = this.generateUrl(uri);
    return this.requestFactory.makeRequest(URL).then(parseResponse);
  }

  getResource<ResponseType>(uri: string): Promise<ResponseType> {
    const URL = this.generateUrl(uri);
    return this.requestFactory.makeRequest(URL).then(parseResponse);
  }

  createResource<ResponseType>(
    uri: string,
    params: Object,
    otherOptions?: AxiosRequestConfig
  ): Promise<ResponseType> {
    const URL = this.generateUrl(uri);
    return this.requestFactory
      .makeRequest(URL, 'POST', params, otherOptions)
      .then(parseResponse);
  }

  updateResource<ResponseType>(
    uri: string,
    params: Object,
  ): Promise<ResponseType> {
    const URL = this.generateUrl(uri);
    return this.requestFactory
      .makeRequest(URL, 'PUT', params)
      .then(parseResponse);
  }

  deleteResource<ResponseType>(uri: string): Promise<ResponseType> {
    const URI = this.generateUrl(uri);
    return this.requestFactory.makeRequest(URI, 'DELETE').then(parseResponse);
  }

  /** */
  listMembers(): Promise<Array<Member>> {
    return this.listResource('members');
  }

  /** */
  getMember(userID: ID): Promise<Member> {
    return this.getResource(`members/${userID}`);
  }

  /** */
  getCurrentUser(): Promise<Member> {
    return this.getResource('user');
  }

  /** */
  listProjects(): Promise<Array<Project>> {
    return this.listResource('projects');
  }

  /** */
  getProject(id: ID): Promise<Project> {
    return this.getResource(`projects/${id}`);
  }

  /** */
  createProject(params: ProjectChange): Promise<Project> {
    return this.createResource('projects', params);
  }

  /** */
  updateProject(id: ID, params: ProjectChange): Promise<Project> {
    return this.updateResource(`projects/${id}`, params);
  }

  /** */
  deleteProject(id: ID): Promise<{}> {
    return this.deleteResource(`projects/${id}`);
  }

  /** */
  listEpics(): Promise<Array<Epic>> {
    return this.listResource('epics');
  }

  /** */
  getEpic(epicID: ID): Promise<Epic> {
    return this.getResource(`epics/${epicID}`);
  }

  /** */
  createEpic(params: EpicChange): Promise<Epic> {
    return this.createResource('epics', params);
  }

  /** */
  updateEpic(epicID: ID, params: EpicChange): Promise<Epic> {
    return this.updateResource(`epics/${epicID}`, params);
  }

  /** */
  deleteEpic(epicID: ID): Promise<{}> {
    return this.deleteResource(`epics/${epicID}`);
  }

  /** */
  listStories(projectID: ID): Promise<Array<Story>> {
    return this.listResource(`projects/${projectID}/stories`);
  }

  /** */
  createStory(params: StoryChange): Promise<Story> {
    return this.createResource('stories', params);
  }

  /** */
  getStory(storyID: ID): Promise<Story> {
    return this.getResource(`stories/${storyID}`);
  }

  /** */
  updateStory(storyID: ID, params: StoryChange): Promise<Story> {
    return this.updateResource(`stories/${storyID}`, params);
  }

  /** */
  deleteStory(storyID: ID): Promise<{}> {
    return this.deleteResource(`stories/${storyID}`);
  }

  /** */
  createStoryComment(storyID: ID, text: string): Promise<StoryComment> {
    return this.createResource(`stories/${storyID}/comments`, { text });
  }

  /** */
  listTasks(storyID: ID): Promise<Array<Task>> {
    return this.listResource(`stories/${storyID}/tasks`);
  }

  /** */
  createTask(storyID: ID, params: TaskChange): Promise<Task> {
    return this.createResource(`stories/${storyID}/tasks`, params);
  }

  /** */
  getTask(storyID: ID, taskID: ID): Promise<Task> {
    return this.getResource(`stories/${storyID}/tasks/${taskID}`);
  }

  /** */
  updateTask(storyID: ID, taskID: ID, params: TaskChange): Promise<Task> {
    return this.updateResource(`stories/${storyID}/tasks/${taskID}`, params);
  }

  /** */
  deleteTask(storyID: ID, taskID: ID): Promise<{}> {
    return this.deleteResource(`stories/${storyID}/tasks/${taskID}`);
  }

  /** */
  listWorkflows(): Promise<Array<Workflow>> {
    return this.listResource('workflows');
  }

  /** */
  createStoryLink(params: StoryLink): Promise<StoryLink> {
    return this.createResource('story-links', params);
  }

  /** */
  getStoryLink(storyLinkID: ID): Promise<StoryLink> {
    return this.getResource(`story-links/${storyLinkID}`);
  }

  /** */
  deleteStoryLink(storyLinkID: ID): Promise<{}> {
    return this.deleteResource(`story-links/${storyLinkID}`);
  }

  /** */
  listFiles(): Promise<Array<File>> {
    return this.listResource('files');
  }

  /** */
  updateFile(fileID: ID, params: FileChange): Promise<File> {
    return this.updateResource(`files/${fileID}`, params);
  }

  /** */
  deleteFile(fileID: ID): Promise<{}> {
    return this.deleteResource(`files/${fileID}`);
  }

  /** */
  listLinkedFiles(): Promise<Array<LinkedFile>> {
    return this.listResource('linked-files');
  }

  /** */
  createLinkedFile(params: LinkedFileChange): Promise<LinkedFile> {
    return this.createResource('linked-files', params);
  }

  /** */
  updateLinkedFile(
    linkedFileID: ID,
    params: LinkedFileChange,
  ): Promise<LinkedFile> {
    return this.updateResource(`linked-files/${linkedFileID}`, params);
  }

  /** */
  deleteLinkedFile(linkedFileID: ID): Promise<{}> {
    return this.deleteResource(`linked-files/${linkedFileID}`);
  }

  listLabels(): Promise<Label[]> {
    return this.listResource('labels');
  }

  /** */
  deleteLabel(labelId: string|number): Promise<{}> {
    return this.deleteResource(`labels/${labelId}`);
  }

  updateLabel(labelId: string|number, updateOpts: {archived?: boolean, color?: string, name?: string}): Promise<{}> {
    return this.updateResource(`labels/${labelId}`, updateOpts);
  }

  searchStories(storyQuery: object): Promise<Story[]> {
    return this.createResource('stories/search', storyQuery);
  }
}