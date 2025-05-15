import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const AdminStatsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />Site Statistics</CardTitle>
        <CardDescription>View most viewed items, popular search terms, etc.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
        <p className="text-sm mt-2">This section will display key metrics like total items, total use cases, most viewed pages, popular search queries, and suggestion statistics.</p>
      </CardContent>
    </Card>
  );
};

export default AdminStatsTab;
