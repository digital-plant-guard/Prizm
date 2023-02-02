import { JsonArray } from '@angular-devkit/core';
import { Rule, Tree } from '@angular-devkit/schematics';
import {
  getWorkspace,
  ProjectDefinition,
  updateWorkspace,
  WorkspaceDefinition,
} from '@schematics/angular/utility/workspace';
import { getProject, getProjectTargetOptions } from '../../utils/get-project';
import { Schema } from '../schema';

const FONT_ASSET = {
  glob: '**/*',
  input: 'node_modules/@prizm-ui/components/src/styles/fonts',
  output: 'assets/prizm-ui/fonts', // TODO test this in real app
};

const INSTALL_STYLES = ['node_modules/@prizm-ui/components/src/styles/styles.less'];

const ICON_STYLES = ['node_modules/@prizm-ui/components/src/styles/icons/icons.less'];
export function addStyles(options: Schema): Rule {
  return async (tree: Tree): Promise<Rule> => {
    const workspace = await getWorkspace(tree);
    const project = getProject(options, workspace);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return addStylesToAngularJson(workspace, project, options);
  };
}

export function addStylesToAngularJson(
  workspace: WorkspaceDefinition,
  project: ProjectDefinition,
  options: Schema
): void | Rule | PromiseLike<void | Rule> {
  const targetOptions = getProjectTargetOptions(project, 'build');
  const styles = targetOptions.styles as JsonArray | undefined;
  const assets = targetOptions.assets as JsonArray | undefined;

  let installStyles = [...INSTALL_STYLES];

  if (options.installIcons) {
    installStyles = [...installStyles, ...ICON_STYLES];
  }

  // Install styles
  if (!styles) {
    targetOptions.styles = installStyles;
  } else {
    targetOptions.styles = [...styles, ...installStyles];
  }

  // Install assets
  if (!assets) {
    targetOptions.assets = [FONT_ASSET];
  } else {
    targetOptions.assets = [...assets, FONT_ASSET];
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return updateWorkspace(workspace);
}
