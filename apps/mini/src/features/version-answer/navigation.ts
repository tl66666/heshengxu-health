import { userStorageKey } from '../auth/user-storage.js';
import { redirectTo } from '../../utils/router.js';
import type { TopicId } from './types.js';
export type LibraryDestination = {
  tab: 'topics' | 'reading' | 'actions';
  topic?: TopicId;
  focus?: string;
};
let pending: { account: string; destination: LibraryDestination } | null = null;
const route = 'pages/version-answer/VersionAnswerPage';
function destinationUrl(destination: LibraryDestination) {
  const values = [`tab=${destination.tab}`];
  if (destination.topic) values.push(`topic=${encodeURIComponent(destination.topic)}`);
  if (destination.focus) values.push(`focus=${encodeURIComponent(destination.focus)}`);
  return '/' + route + '?' + values.join('&');
}
export function consumeLibraryDestination(): LibraryDestination | null {
  const value = pending;
  pending = null;
  return value?.account === userStorageKey('heban.version-answer.v1') ? value.destination : null;
}
export function returnToLibrary(destination: LibraryDestination) {
  const pages = getCurrentPages();
  const index = pages.slice(0, -1).findIndex((page) => page.route?.replace(/^\//, '') === route);
  if (index < 0) {
    pending = null;
    redirectTo(destinationUrl(destination));
    return;
  }
  pending = { account: userStorageKey('heban.version-answer.v1'), destination };
  uni.navigateBack({
    delta: pages.length - 1 - index,
    fail: () => {
      pending = null;
      redirectTo(destinationUrl(destination));
    },
  });
}
