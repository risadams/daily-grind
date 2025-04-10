import React from 'react';
import Dialog from './Dialog.js';
import TaskForm from './TaskForm.js';

const TaskFormDialog = ({ 
  isOpen, 
  onClose, 
  task, 
  onSubmit, 
  title = 'Create Task'
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={task ? `Edit Task #${task.id}` : title}
      size="lg"
    >
      <TaskForm
        initialData={task}
        onSubmit={async (data) => {
          await onSubmit(data);
          onClose();
        }}
        onCancel={onClose}
        isEditing={!!task}
      />
    </Dialog>
  );
};

export default TaskFormDialog;