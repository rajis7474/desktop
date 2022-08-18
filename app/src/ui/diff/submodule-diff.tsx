import React from 'react'
import { parseRepositoryIdentifier } from '../../lib/remote-parsing'
import { ISubmoduleDiff } from '../../models/diff'
import { LinkButton } from '../lib/link-button'
import { Octicon } from '../octicons'
import * as OcticonSymbol from '../octicons/octicons.generated'
import { SuggestedAction } from '../suggested-actions'

type SubmoduleItemIcon =
  | {
      readonly octicon: typeof OcticonSymbol.info
      readonly className: 'info-icon'
    }
  | {
      readonly octicon: typeof OcticonSymbol.diffModified
      readonly className: 'modified-icon'
    }
  | {
      readonly octicon: typeof OcticonSymbol.fileDiff
      readonly className: 'untracked-icon'
    }

interface ISubmoduleDiffProps {
  readonly onOpenSubmodule?: (fullPath: string) => void
  readonly diff: ISubmoduleDiff
}

export class SubmoduleDiff extends React.Component<ISubmoduleDiffProps> {
  public constructor(props: ISubmoduleDiffProps) {
    super(props)
  }

  public render() {
    return (
      <div className="changes-interstitial submodule-diff">
        <div className="content">
          <div className="header">
            <div className="text">
              <h1>Submodule changes</h1>
            </div>
          </div>
          {this.renderSubmoduleInfo()}
          {this.renderCommitChangeInfo()}
          {this.renderSubmodulesChangesInfo()}
          {this.renderOpenSubmoduleAction()}
        </div>
      </div>
    )
  }

  private renderSubmoduleInfo() {
    // TODO: only for GH submodules?
    // TODO: test with submodules without URL (is that possible? maybe a submodule
    // from a local repo??)

    const repoIdentifier = parseRepositoryIdentifier(this.props.diff.url)
    if (repoIdentifier === null) {
      return null
    }

    const hostname =
      repoIdentifier.hostname === 'github.com'
        ? ''
        : ` (${repoIdentifier.hostname})`

    return this.renderSubmoduleDiffItem(
      { octicon: OcticonSymbol.info, className: 'info-icon' },
      <>
        This is a submodule based on the repository{' '}
        <LinkButton
          uri={`https://${repoIdentifier.hostname}/${repoIdentifier.owner}/${repoIdentifier.name}`}
        >
          {repoIdentifier.owner}/{repoIdentifier.name}
          {hostname}
        </LinkButton>
        .
      </>
    )
  }

  private renderCommitChangeInfo() {
    const { diff } = this.props

    if (!diff.status.commitChanged) {
      return null
    }

    return this.renderSubmoduleDiffItem(
      { octicon: OcticonSymbol.diffModified, className: 'modified-icon' },
      <>
        This submodule has changed its commit from{' '}
        <LinkButton>{diff.oldSHA}</LinkButton> to{' '}
        <LinkButton>{diff.newSHA}</LinkButton>. This change can be committed to
        the parent repository.
      </>
    )
  }

  private renderSubmodulesChangesInfo() {
    const { diff } = this.props

    if (!diff.status.untrackedChanges) {
      return null
    }

    return this.renderSubmoduleDiffItem(
      { octicon: OcticonSymbol.fileDiff, className: 'untracked-icon' },
      <>
        This submodule has modified and untracked changes. Those changes must be
        committed inside of the submodule before they can be part of the parent
        repository.
      </>
    )
  }

  private renderSubmoduleDiffItem(
    icon: SubmoduleItemIcon,
    content: React.ReactElement
  ) {
    return (
      <div className="item">
        <Octicon symbol={icon.octicon} className={icon.className} />
        <div className="content">{content}</div>
      </div>
    )
  }

  private renderOpenSubmoduleAction() {
    return (
      <span>
        <SuggestedAction
          title="Open this submodule on GitHub Desktop"
          description="You can open this submodule on GitHub Desktop as a normal repository to manage and commit any changes in it."
          buttonText={__DARWIN__ ? 'Open Repository' : 'Open repository'}
          type="primary"
          onClick={this.onOpenSubmoduleClick}
        />
      </span>
    )
  }

  private onOpenSubmoduleClick = () => {
    this.props.onOpenSubmodule?.(this.props.diff.fullPath)
  }
}
