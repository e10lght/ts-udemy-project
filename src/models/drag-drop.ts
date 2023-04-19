// drag&drop
export interface Draggable {
  dragStartHandkler(event: DragEvent): void;
  dragEndHandkler(event: DragEvent): void;
}
export interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}
