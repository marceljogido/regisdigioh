import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DocumentPlusIcon } from '@heroicons/react/24/outline';
import { useState } from "react";

interface ImportDataFormProps {
    onImport: (selectedFile: File) => void;
}

const ImportDataForm: React.FC<ImportDataFormProps> = ({ onImport }) => {
    const [fileName, setFileName] = useState("No file selected");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleDownloadTemplate = () => {
        try {
            const url = '/template/import_template.xlsx';
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'import_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading the template:', error);
        }
    };

    const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedFile) {
            console.error("No file selected for import.");
            return;
        }

        onImport(selectedFile)
    };

    return (
        <Card className="w-full max-w-lg p-3 flex flex-col justify-center rounded-3xl drop-shadow-xl">
            <CardHeader className="space-y-1 items-center bg-gradient-to-r from-pink-400 to-pink-700 rounded-t-3xl">
                <CardTitle className="flex items-center font-bold text-white text-4xl">
                <DocumentPlusIcon className="h-8 w-8 mr-2" />
                Create Event
                </CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
                <form className="space-y-4" onSubmit={handleImport}>
                    <div className="flex flex-col space-y-2">
                        <div className="relative">
                            <Input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileChange}
                                required
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="flex items-center justify-between p-2 border rounded-md bg-white cursor-pointer">
                                <span>{fileName}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mt-4">
                        <Button
                            type="button"
                            className="text-pink-700 font-extrabold py-2 px-4 rounded-lg bg-white shadow border border-[#C1599E] hover:border-gray-300"
                            onClick={handleDownloadTemplate}
                        >
                            Download Template
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-pink-400 to-pink-700 font-extrabold text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition-transform transform hover:scale-105">
                            IMPORT!
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ImportDataForm;
