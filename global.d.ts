export {};
import { QualifiedConfig } from '@commitlint/types';

declare global {
  // Replace any with a more specific type if available.
  // eslint-disable-next-line no-var
  var commitlint: QualifiedConfig;
}
