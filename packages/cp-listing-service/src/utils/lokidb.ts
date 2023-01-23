import Loki from 'lokijs';
import fa5Icons from './data/fa5Icons.json';
import AmenityDBService from '../services/amenity.service';
import ListingPurposeDBService from '../services/purpose.service';
import ListingTypeDBService from '../services/listingType.service';
import HouseRulesDBService from '../services/houseRules.service';

const amenityService = new AmenityDBService();
const purposeService = new ListingPurposeDBService();
const listingTypeService = new ListingTypeDBService();
const houseRulesService = new HouseRulesDBService();

const db = new Loki('lokidb.json');

export const initLokiDB = async () => {
  const amenityCategories = (await amenityService.getAmenityCategories()).data;
  const purposes = (await purposeService.getListingPurposes()).data;
  const subgroups = (await purposeService.getAllSubgroups()).data;
  const amenities = (await amenityService.getAllAmenities()).data;
  const listingTypes = (await listingTypeService.getListingTypes()).data;
  const houseRules = (await houseRulesService.getHouseRules()).data;
  // TODO: Add Other resources to cache
  // const listings = await prisma.listing.findMany({});
  // const listingAmenities = await prisma.listingHasAmenities.findMany({});

  const faIconsData = fa5Icons.map((icon) => {
    const [prefix, name] = icon.split(' ');
    return {
      name,
      prefix,
    };
  });

  db.addCollection('amenityCategories', { indices: ['amenityCategory'] }).insert(amenityCategories);
  db.addCollection('purposes', { indices: ['listingPurpose'] }).insert(purposes);
  db.addCollection('subgroups', { indices: ['purposeSubgroup'] }).insert(subgroups);
  db.addCollection('listingTypes', { indices: ['listingType'] }).insert(listingTypes);
  db.addCollection('amenities', { indices: ['amenity'] }).insert(amenities);
  db.addCollection('houseRules', { indices: ['houseRule'] }).insert(houseRules);
  // db.addCollection('listings').insert(listings);
  // db.addCollection('listingAmenities').insert(listingAmenities);
  await db.addCollection('faIcons').insert(faIconsData);

  db.saveDatabase();
};
