import React from "react";

interface DeleteGuestDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    guests: Set<number>;
}

const DeleteGuestDialog: React.FC<DeleteGuestDialogProps> = ({ open, onClose, guests, onConfirm }) => {
    if (!open || !guests) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl font-bold mb-4">Delete Guest</h2>
                <p className="mb-4">
                    Are you sure you want to delete {guests.size} data? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteGuestDialog;
