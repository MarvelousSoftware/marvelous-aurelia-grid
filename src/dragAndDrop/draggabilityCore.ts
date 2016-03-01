import {Utils} from 'marvelous-aurelia-core/utils';

export class DraggabilityCore {
  config = {
    isHandle: undefined, // checks if clicked element is the one to be dragged and dropped
    ghost: { // defined if ghost to be created
      className: undefined,
      containerSelector: undefined,
      html: undefined
    },
    handler: {
      started: undefined,
      droppableElement: undefined,
      dropped: undefined,
      overDroppable: undefined,
      outsideDroppable: undefined,
      canceled: undefined
    },
    draggedElement: undefined
  };
  state;
  element;

  constructor(config) {
    if(!config) {
      throw new Error('Config is undefined.');
    }
    if(!Utils.allDefined(config, 'isHandle')) {
      throw new Error('Config has missing fields or functions.');
    }
    if(config.ghost) {
      if(!Utils.allDefined(config.ghost, 'className', 'containerSelector', 'html')) {
        throw new Error('Config has missing ghost configuration.');
      }
    } else {
      if(!Utils.allDefined(config, 'draggedElement')) {
        throw new Error('Config has missing configuration.');
      }
    }

    config.handler = config.handler || {};
    config.handler.started = config.handler.started || Utils.noop;
    config.handler.droppableElement = config.handler.droppableElement || Utils.noop;
    config.handler.dropped = config.handler.dropped || Utils.noop;
    config.handler.overDroppable = config.handler.overDroppable || Utils.noop;
    config.handler.outsideDroppable = config.handler.outsideDroppable || Utils.noop;
    config.handler.canceled = config.handler.canceled || Utils.noop;

    this.config = config;
    this.state = this.getInitialState();
  }

  register() {
    var that = this;
    var down = function(e) { that.onMouseDown(e || window.event); }
    var up = function(e) { that.onMouseUp(e || window.event); }
    var move = function(e) { that.onMouseMove(e || window.event); }

    document.addEventListener('mousedown', down, false);
    document.addEventListener('mouseup', up, false);
    document.addEventListener('mousemove', move, false);

    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('mouseup', up);
      document.removeEventListener('mousemove', move);
    };
  }

  onMouseDown(e) {
    // checks whether currently clicked element is the one to be dragged
    var el = e.target;
    var correctElement = false;
    while (el && el.tagName != 'M-GRID') {
      if(this.config.isHandle(el)) {
        correctElement = true;
        break;
      }
      el = el.parentElement;
    }

    if(!correctElement) {
      return;
    }

    this.element = el;

    this.state.moving = false;
    this.state.mouseDown = true;
    this.state.ghostCreated = false;

    Utils.preventDefaultAndPropagation(e);
  }

  onMouseUp(e) {
    var handle = this.state.mouseDown;
    this.state.mouseDown = false;

    if(!handle) {
      return;
    }

    if(this.state.droppableElement) {
      this.config.handler.dropped(e, this.element);
    } else {
      this.config.handler.canceled(e, this.element);
    }

    this.deleteGhost();
    this.state = this.getInitialState();
  }

  onMouseMove(e) {
    if(!this.state.mouseDown) {
      return;
    }

    if(!this.state.moving) {
      this.state.moving = true;
      return;
    }

    Utils.preventDefaultAndPropagation(e);

    this.config.handler.started(e, this.element);

    var oldDroppableElement = this.state.droppableElement;
    this.state.droppableElement = this.config.handler.droppableElement(e, this.element);
    if(oldDroppableElement !== this.state.droppableElement) {
      if(this.state.droppableElement && oldDroppableElement) {
        this.config.handler.outsideDroppable(e, oldDroppableElement);
        this.config.handler.overDroppable(e, this.element);
      } else if(this.state.droppableElement) {
        this.config.handler.overDroppable(e, this.element);
      } else {
        this.config.handler.outsideDroppable(e, this.element);
      }
    }

    this.createGhost();

    if(this.config.ghost) {
      this.state.draggedElement.style.left = (e.pageX - this.state.draggedElement.clientWidth/2) + "px";
      this.state.draggedElement.style.top = (e.pageY - 15) + "px";
    } else {
      this.state.draggedElement.style.left = parseInt(this.state.draggedElement.style.left || 0) + e.movementX + "px";
      this.state.draggedElement.style.top = parseInt(this.state.draggedElement.style.top || 0) + e.movementY + "px";
    }
  }

  createGhost() {
    if(!this.config.ghost) {
      return;
    }

    if(this.state.ghostCreated) {
      return;
    }

    var ghost = document.createElement("div");
    ghost.classList.add(this.config.ghost.className);
    ghost.innerHTML = this.config.ghost.html(this.element);

    var container = document.body.querySelector(this.config.ghost.containerSelector);
    container.appendChild(ghost);

    this.state.ghostCreated = true;
    this.state.draggedElement = ghost;
  }

  deleteGhost() {
    if(this.state.draggedElement && this.config.ghost) {
      this.state.draggedElement.parentNode.removeChild(this.state.draggedElement);
    }
  }

  getInitialState() {
    return {
      moving: false,
      mouseDown: false,
      ghostCreated: false,
      draggedElement: this.config.draggedElement || null,
      droppableElement: undefined
    };
  };
}