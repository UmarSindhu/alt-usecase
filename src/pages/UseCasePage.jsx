import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Share2, Tag, ArrowLeft, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { getItemBySlug, voteOnUseCase } from '@/lib/services/itemService';
import { useToast } from '@/components/ui/use-toast';
import NotFoundPage from '@/pages/NotFoundPage';
import AdPlaceholder from '@/components/AdPlaceholder';

const UseCasePage = () => {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItemData = async () => {
    setLoading(true);
    const fetchedItem = await getItemBySlug(slug);
    setItem(fetchedItem);
    setLoading(false);
  };

  useEffect(() => {
    fetchItemData();
  }, [slug]);

  const handleVote = async (useCaseId, voteType) => {
    const success = await voteOnUseCase(useCaseId, voteType);
    if (success) {
      toast({
        title: "Vote Submitted!",
        description: `Your vote for this use case has been recorded.`,
      });
      // Refresh item data to show updated vote counts
      const updatedItem = await getItemBySlug(slug); // Re-fetch to get latest votes
      setItem(updatedItem);
    } else {
      toast({
        title: "Vote Failed",
        description: "Could not record your vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform) => {
    if (!item) return;
    const url = window.location.href;
    const text = `Check out these alternative uses for ${item.name}!`;
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'reddit':
        shareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(item?.image_url || item?.og_image_url || '')}&description=${encodeURIComponent(text)}`;
        break;
      default:
        navigator.clipboard.writeText(url).then(() => {
          toast({ title: "Link Copied!", description: "URL copied to clipboard." });
        }).catch(err => {
          toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" });
        });
        return;
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!item) {
    return <NotFoundPage />;
  }
  console.log(item);
  return (
    <>
      <Helmet>
        <title>{item.seo_title || `${item.name} - Alternative Uses`} | Alt Use Case</title>
        <meta name="description" content={item.seo_description || `Discover creative alternative uses for ${item.name}.`} />
        <link rel="canonical" href={item.canonical_url || window.location.href} />
        {(item.og_image_url || item.image_url) && <meta property="og:image" content={item.og_image_url || item.image_url} />}
        <meta property="og:title" content={item.seo_title || `${item.name} - Alternative Uses`} />
        <meta property="og:description" content={item.seo_description || `Discover creative alternative uses for ${item.name}.`} />
        <meta property="og:type" content="article" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <Button variant="outline" asChild className="mb-6 print:hidden">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>

        <header className="relative rounded-xl overflow-hidden p-6 sm:p-8 md:p-12 min-h-[250px] sm:min-h-[300px] flex flex-col justify-end items-start bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/10 dark:to-secondary/10">
          {item.image_url && (
            <img 
              alt={`Image of ${item.name}`}
              className="absolute inset-0 w-full h-full object-cover opacity-30 dark:opacity-20"
              src={item.image_url} />
          )}
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 text-foreground capitalize">{item.name}</h1>
            <p className="text-md sm:text-lg text-muted-foreground max-w-2xl">
              {item.seo_description || `Explore ${item.uses?.length || 0} creative and practical alternative uses for ${item.name}.`}
            </p>
            {item.affiliate_link && (
              <Button variant="outline" size="sm" asChild className="bg-primary mt-3 sm:mb-4 text-xs sm:text-sm">
                <a href={item.affiliate_link} target="_blank" rel="noopener noreferrer">
                  Find Product <ExternalLink className="ml-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              </Button>
            )}
            {!item.affiliate_link && (
            <Button variant="outline" size="sm" asChild className="bg-primary mt-3 sm:mb-4 text-xs sm:text-sm">
              <a href={`https://www.amazon.com/s?k=${item.name}`} target="_blank" rel="noopener noreferrer nofollow">
                Find Product <ExternalLink className="ml-1.5 h-3 w-3 sm:h-4 sm:w-4" />
              </a>
            </Button>
            )}
          </div>
        </header>

        <AdPlaceholder slotKey="ad_slot_usecase_page_top_enabled" defaultText="Top of Page Ad" className="h-32 mb-6" />

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          <div className="md:col-span-2 space-y-6">
            {item.uses && item.uses.length > 0 ? item.uses.map((useCase, index) => (
              <React.Fragment key={index}>
                <motion.div
                  key={useCase.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* useCase.image_url && (
                      <div className="aspect-video bg-muted flex items-center justify-center">
                          <img  alt={useCase.title} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1675023112817-52b789fd2ef0" />
                      </div>
                    ) */}
                    {/* !useCase.image_url && (
                      <div className="aspect-video bg-muted/30 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50" />
                      </div>
                    ) */}
                    <CardHeader className="pt-4 sm:pt-6">
                      <CardTitle className="text-xl sm:text-2xl">{useCase.title}</CardTitle>
                      {useCase.difficulty && <Badge variant="outline" className="mt-1 text-xs sm:text-sm w-fit">{useCase.difficulty}</Badge>}
                    </CardHeader>
                    <CardContent className="pb-4 sm:pb-6">
                      <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">{useCase.description}</p>
                      {useCase.affiliate_link && (
                        <Button variant="outline" size="sm" asChild className="mb-3 sm:mb-4 text-xs sm:text-sm">
                          <a href={useCase.affiliate_link} target="_blank" rel="noopener noreferrer">
                            Find Product <ExternalLink className="ml-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                          </a>
                        </Button>
                      )}
                      {!useCase.affiliate_link && (
                        <Button variant="outline" size="sm" asChild className="mb-3 sm:mb-4 text-xs sm:text-sm">
                          <a href={`https://www.amazon.com/s?k=${useCase.title}`} target="_blank" rel="noopener noreferrer">
                            Find Product <ExternalLink className="ml-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                          </a>
                        </Button>
                      )}
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleVote(useCase.id, 'yes')} className="text-xs sm:text-sm">
                          <ThumbsUp className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Vote up ({useCase.votes_yes || 0})
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleVote(useCase.id, 'no')} className="text-xs sm:text-sm">
                          <ThumbsDown className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Vote down ({useCase.votes_no || 0})
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                {(index + 1) % 3 === 0 && index < item.uses.length -1 && (
                    <AdPlaceholder slotKey="ad_slot_usecase_page_incontent_enabled" defaultText={`In-Content Ad Spot ${Math.floor(index/3)+1}`} className="h-28 my-6" />
                )}
              </React.Fragment>
            )) : (
              <p className="text-muted-foreground col-span-full text-center py-8">No specific uses listed for this item yet.</p>
            )}
            <Separator className="my-8" />
            <AdPlaceholder slotKey="ad_slot_usecase_page_bottom_enabled" defaultText="Bottom of Page Ad" className="h-32 mb-6" />
          </div>

          <aside className="space-y-6 md:sticky md:top-24 self-start print:hidden">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg sm:text-xl flex items-center">
                  <Share2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Share
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pt-2">
                {['twitter', 'facebook', 'reddit', 'pinterest', 'copy'].map(platform => (
                  <Button key={platform} variant="outline" size="sm" onClick={() => handleShare(platform)} className="capitalize text-xs sm:text-sm">
                    {platform === 'copy' ? 'Copy Link' : platform}
                  </Button>
                ))}
              </CardContent>
            </Card>
            
            {item.categories && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg sm:text-xl flex items-center">
                    <Tag className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-2">
                  {item.categories && item.categories.length > 0 ? (
                    item.categories.map(category => (
                      <Button 
                        key={category.slug} 
                        asChild
                        variant="outline" 
                        size="sm" 
                        className="text-xs sm:text-sm"
                      >
                        <Link to={`/category/${category.slug}`}>
                          {category.name}
                        </Link>
                      </Button>
                    ))
                  ) : (
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      Uncategorized
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}

            {item.tags && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg sm:text-xl flex items-center">
                    <Tag className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-2">
                  {item.tags && item.tags.length > 0 ? (
                      item.tags.map((tag, index) => (
                          <Button 
                              key={index} 
                              asChild
                              variant="outline" 
                              size="sm" 
                              className="text-xs sm:text-sm capitalize"
                          >
                              <Link to={`/tag/${tag}`}>
                                  {tag}
                              </Link>
                          </Button>
                      ))
                  ) : (
                      <Badge variant="secondary" className="text-xs sm:text-sm">
                          Uncategorized
                      </Badge>
                  )}
                </CardContent>
              </Card>
            )}

            <AdPlaceholder slotKey="ad_slot_usecase_aside_bottom_enabled" defaultText="Aside Ad" className="h-36 mb-6" />

          </aside>
        </div>
      </motion.div>
    </>
  );
};

export default UseCasePage;
