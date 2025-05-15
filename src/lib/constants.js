import { 
  Package, Home as HomeIcon, Utensils, Wrench, Cpu, Palette,
  Car, Tent, Leaf, Shirt, Gem, Sofa, Box, PawPrint,
  Music, BookOpen, Lightbulb, Dumbbell, Cuboid, School,
  Gift, CircleDashed, ShoppingCart, FlaskConical, Ruler, Bike,
  Hammer, FlaskRound, Puzzle, TreePine, Cloud, Droplets,
  Gamepad2, Camera, Plug, GlassWater, Scissors, Globe
} from 'lucide-react';

export const CATEGORIES = [
  // Original categories
  { name: 'Tech', slug: 'tech', icon: Cpu, description: "Alternative uses for gadgets and tech accessories." },
  { name: 'Household', slug: 'household', icon: HomeIcon, description: "Clever uses for household items." },
  { name: 'Food', slug: 'food', icon: Utensils, description: "Unexpected ways to use food items." },
  { name: 'DIY', slug: 'diy', icon: Wrench, description: "Creative DIY projects." },
  { name: 'Office', slug: 'office', icon: Package, description: "Smart uses for office supplies." },
  { name: 'Crafts', slug: 'crafts', icon: Palette, description: "Artistic material reuse." },

  // New categories with verified icons
  { name: 'Car Hacks', slug: 'car-hacks', icon: Car, description: "Unusual vehicle uses." },
  { name: 'Camping Gear', slug: 'camping-gear', icon: Tent, description: "Outdoor equipment repurposing." },
  { name: 'Eco Living', slug: 'eco-living', icon: Leaf, description: "Sustainable reuse ideas." },
  { name: 'Fashion', slug: 'fashion', icon: Shirt, description: "Non-clothing uses for garments." },
  { name: 'Beauty', slug: 'beauty', icon: Gem, description: "Makeup product alternatives." },
  { name: 'Furniture', slug: 'furniture', icon: Sofa, description: "Unconventional furniture uses." },
  { name: 'Storage', slug: 'storage', icon: Box, description: "Innovative organization solutions." },
  { name: 'Pet Supplies', slug: 'pet-supplies', icon: PawPrint, description: "Repurposing pet gear." },
  { name: 'Music', slug: 'music', icon: Music, description: "Alternative instrument uses." },
  { name: 'Books', slug: 'books', icon: BookOpen, description: "Creative book repurposing." },
  { name: 'Lighting', slug: 'lighting', icon: Lightbulb, description: "Unusual light source uses." },
  { name: 'Fitness', slug: 'fitness', icon: Dumbbell, description: "Non-exercise equipment uses." },
  { name: 'Construction', slug: 'construction', icon: Cuboid, description: "Building material alternatives." },
  { name: 'School', slug: 'school', icon: School, description: "Educational supply hacks." },
  { name: 'Holiday', slug: 'holiday', icon: Gift, description: "Post-holiday decoration uses." },
  { name: 'Party', slug: 'party', icon: CircleDashed, description: "Party supply repurposing." }, // Alternative to Balloon
  { name: 'Shopping', slug: 'shopping', icon: ShoppingCart, description: "Packaging reuse ideas." },
  { name: 'Science', slug: 'science', icon: FlaskConical, description: "Household science hacks." },
  { name: 'Measuring', slug: 'measuring', icon: Ruler, description: "Measurement tool alternatives." },
  { name: 'Bicycles', slug: 'bicycles', icon: Bike, description: "Bike part repurposing." },
  { name: 'Tools', slug: 'tools', icon: Hammer, description: "Non-traditional tool uses." },
  { name: 'Chemistry', slug: 'chemistry', icon: FlaskRound, description: "Household chemical applications." },
  { name: 'Games', slug: 'games', icon: Gamepad2, description: "Game piece alternatives." },
  { name: 'Photography', slug: 'photography', icon: Camera, description: "Camera gear repurposing." },
  { name: 'Electronics', slug: 'electronics', icon: Plug, description: "Creative electronic uses." },
  { name: 'Liquids', slug: 'liquids', icon: Droplets, description: "Unusual liquid applications." }
];

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];