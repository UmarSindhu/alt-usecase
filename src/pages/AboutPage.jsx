import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Zap, Users, Target, Sparkles, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 
import { Link } from 'react-router-dom';


const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Alt Use Case | Our Mission and Story</title>
        <meta name="description" content="Learn about Alt Use Case (AUC), our mission to uncover hidden potential in everyday items, and how we're building a community of creative problem-solvers." />
        <link rel="canonical" href="https://altusecase.com/about" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-12"
      >
        <section className="text-center py-12 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 dark:from-primary/5 dark:to-secondary/5 rounded-xl shadow-lg">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 120 }}
          >
            <Zap className="mx-auto h-20 w-20 text-primary mb-6" />
          </motion.div>
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-4 gradient-text"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            About Alt Use Case
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Uncovering the hidden potential in everyday objects, tools, and skills. We believe creativity and resourcefulness can transform the ordinary into the extraordinary.
          </motion.p>
        </section>

        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-4">Our Mission <Target className="inline h-7 w-7 ml-2 text-primary" /></h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              At Alt Use Case (AUC), our mission is simple: to inspire a more resourceful and creative world. We aim to be the go-to public resource for discovering alternative, practical, and innovative uses for virtually anything. Whether it's a household item, a digital tool, or a personal skill, we believe there's always more than meets the eye.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We're passionate about sustainability, DIY culture, and the joy of finding clever solutions. By sharing these alternative uses, we hope to encourage people to think outside the box, reduce waste, and unlock new possibilities.
            </p>
          </div>
          <div>
            <img 
              className="rounded-lg shadow-xl object-cover w-full h-auto max-h-[400px]"
              alt="Team brainstorming creative ideas" src="../../public/images/about.jpeg" />
          </div>
        </section>

        <section className="bg-secondary/50 dark:bg-secondary/20 p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold mb-6 text-center">What We Do <Sparkles className="inline h-7 w-7 ml-2 text-primary" /></h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center"><Users className="mr-2 text-primary" />Curate & Generate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We collect and, when needed, use AI to generate a vast library of alternative uses. Our goal is to provide a comprehensive, ever-expanding database of creative ideas.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center"><Zap className="mr-2 text-primary" />Inspire Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We strive to spark curiosity and encourage users to see the world differently. Every object holds multiple potentials waiting to be discovered.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center"><Lightbulb className="mr-2 text-primary" />Foster Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Through user suggestions and shared discoveries, we aim to build a community of resourceful individuals who love to learn and share.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
        
        <section className="text-center">
          <h2 className="text-3xl font-semibold mb-4">Join Our Journey!</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Alt Use Case is more than just a website; it's a movement towards more mindful consumption and creative living. Have an idea or want to contribute? We'd love to hear from you!
          </p>
          <Button asChild size="lg">
            <Link to="/suggestions">Suggest an Idea <Sparkles className="ml-2 h-5 w-5" /></Link>
          </Button>
        </section>

      </motion.div>
    </>
  );
};

export default AboutPage;
