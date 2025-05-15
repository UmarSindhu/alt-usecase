
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { AlertCircle, Loader2 } from 'lucide-react';

    const PlaceholderTabContent = ({ title, description, data, isLoading, itemType }) => {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{title || "Coming Soon"}</CardTitle>
            <CardDescription>{description || "This section is under development. Check back later!"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-md">
              <AlertCircle className="h-6 w-6 mr-3 text-yellow-500 dark:text-yellow-400 shrink-0" />
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Full functionality for this section is planned for a future update.
              </p>
            </div>
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading {itemType || 'data'}...</span>
              </div>
            )}
            {!isLoading && data && data.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-sm">Current {itemType ? `${itemType}s` : 'Data Preview'}:</h4>
                <ul className="list-disc list-inside text-xs text-muted-foreground max-h-60 overflow-y-auto border p-2 rounded-md">
                  {data.map((item, index) => (
                    <li key={item.id || index} className="truncate">
                      {item.name || `Item ${index + 1}`} {item.slug && <span className="text-gray-400">({item.slug})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!isLoading && data && data.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No {itemType || 'data'} available yet.</p>
            )}
             {!isLoading && !data && !itemType && (
              <p className="text-sm text-muted-foreground text-center py-4">No preview data for this section.</p>
            )}
          </CardContent>
        </Card>
      );
    };

    export default PlaceholderTabContent;
  