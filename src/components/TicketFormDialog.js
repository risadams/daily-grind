import React from 'react';
import Dialog from './Dialog.js';
import TicketForm from './TicketForm.js';

const TicketFormDialog = ({ 
  isOpen, 
  onClose, 
  ticket, 
  onSubmit, 
  title = 'Create Ticket'
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={ticket ? `Edit Ticket #${ticket.id}` : title}
      size="lg"
    >
      <TicketForm
        initialData={ticket}
        onSubmit={async (data) => {
          await onSubmit(data);
          onClose();
        }}
        onCancel={onClose}
        isEditing={!!ticket}
      />
    </Dialog>
  );
};

export default TicketFormDialog;