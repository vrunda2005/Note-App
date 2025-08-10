import React from 'react';

export default function SummaryBox({ summary }: { summary?: string }) {
    if (!summary) return null;

    return (
        <div className="mt-4 p-3 bg-gray-100 border rounded">
            <h4 className="font-semibold mb-1 text-gray-700">Summary</h4>
            <div
                className="text-gray-700"
                dangerouslySetInnerHTML={{ __html: summary }}
            />
        </div>
    );
}
