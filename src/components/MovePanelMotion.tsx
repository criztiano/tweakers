import { Component, type ReactNode, type RefObject } from 'react';
import { playPanelChange, takePanelPicture, type MovePanelChangeScope, type MovePanelPicture } from '../move-panel-motion';

export interface MovePanelMotionProps {
  /** Where the panel is: which surface (`app`, `room`, `mod`) and which page
   *  of it. A change of page is a page switch; a change of surface moves the
   *  whole inside, header and all. */
  surface: string;
  page: string;
  panel: RefObject<HTMLElement | null>;
  children: ReactNode;
}

/**
 * Plays the control panel's own changes (see `move-panel-motion`). A class,
 * because only a class hears about a change before React puts it on the
 * screen: `getSnapshotBeforeUpdate` takes the picture of what is leaving
 * while it is still there, and `componentDidUpdate` plays it against what
 * arrived. Renders its children untouched.
 */
export class MovePanelMotion extends Component<MovePanelMotionProps> {
  getSnapshotBeforeUpdate(previous: MovePanelMotionProps): MovePanelPicture | null {
    const { surface, page, panel } = this.props;
    if (previous.surface === surface && previous.page === page) return null;
    const scope: MovePanelChangeScope = previous.surface === surface ? 'controls' : 'inside';
    return takePanelPicture(panel.current, scope);
  }

  componentDidUpdate(_previous: MovePanelMotionProps, _state: unknown, picture: MovePanelPicture | null) {
    if (picture) playPanelChange(picture);
  }

  render() {
    return this.props.children;
  }
}
