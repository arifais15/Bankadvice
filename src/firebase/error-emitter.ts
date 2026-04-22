import { EventEmitter } from 'events';

// This is a global event emitter for Firebase errors.
// It's used to surface rich, contextual errors to the UI during development.
export const errorEmitter = new EventEmitter();
