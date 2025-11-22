
import React from 'react';
import { Student } from '../../types';
import Card from '../../components/Card';
import { PhoneIcon } from '../../components/icons';

interface RosterTabProps {
    students: Student[];
}

const RosterTab: React.FC<RosterTabProps> = ({ students }) => {
    return (
        <Card className="p-0 overflow-hidden">
            <div className="p-4"><h2 className="text-xl font-bold">Student Roster</h2></div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Batch</th>
                            <th className="p-4 font-semibold">Parent Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(stud => (
                            <tr key={stud.id} className="border-t dark:border-gray-700">
                                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{stud.name}</td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">{stud.batch}</td>
                                <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                                    {stud.contactNumber ? (
                                        <div className="flex items-center gap-2">
                                            <PhoneIcon className="w-4 h-4 text-sky-500" />
                                            <span className="font-mono">{stud.contactNumber}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">N/A</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default RosterTab;
