
import React from 'react';

interface HeaderProps {
    onNewProject: () => void;
    onGenerateReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewProject, onGenerateReport }) => {
    return (
        <header className="bg-white shadow-md p-3 flex justify-between items-center z-10">
            <h1 className="text-xl font-bold text-gray-800">
                UK Land Feasibility AI <span className="text-sm font-normal text-blue-600">| Powered by Gemini</span>
            </h1>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onNewProject}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    New Project
                </button>
                <button
                    onClick={onGenerateReport}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    Generate Report
                </button>
            </div>
        </header>
    );
};
