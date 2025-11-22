import React from "react";
import { Homework } from "../../types";
import Card from "../../components/Card";
import { BookOpenIcon } from "../../components/icons";

interface HomeworkTabProps {
  homeworkList: Homework[];
}

const HomeworkTab: React.FC<HomeworkTabProps> = ({ homeworkList }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Homework</h2>
      {homeworkList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {homeworkList
            .sort(
              (a, b) =>
                new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
            )
            .map((hw) => (
              <Card
                key={hw.id}
                className="p-6 flex flex-col h-full border-l-4 border-rose-400"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-rose-100 rounded-lg dark:bg-rose-900/30">
                    <BookOpenIcon className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Due Date
                    </p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {hw.dueDate}
                    </p>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">
                  {hw.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                  {hw.description}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded dark:bg-gray-700 dark:text-gray-400">
                    {hw.batch}
                  </span>
                </div>
              </Card>
            ))}
        </div>
      ) : (
        <Card className="p-4 text-center">
          <div className="flex flex-col items-center">
            <BookOpenIcon className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              No Homework Assigned
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Hurray! You have no pending homework at the moment.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HomeworkTab;
