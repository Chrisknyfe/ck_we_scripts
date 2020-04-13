importPackage(Packages.java.io);
importPackage(Packages.java.awt);
importPackage(Packages.com.sk89q.worldedit);
importPackage(Packages.com.sk89q.worldedit.blocks);

// ck hacking
importPackage(Packages.com.sk89q.worldedit.math)
importPackage(Packages.com.sk89q.worldedit.util)

// Batch Scheduling
importPackage(Packages.com.sk89q.worldedit.extension.platform);
importPackage(Packages.org.bukkit);

const WORLD_EDITING = com.sk89q.worldedit.extension.platform.Capability.WORLD_EDITING;

rolling_delay = 0
function scheduleBatch(fn, delay) {
	scheduler = org.bukkit.Bukkit.getScheduler();
	// There has to be a shorter way to get the WorldEditPlugin instance.
	plugin = com.sk89q.worldedit.WorldEdit.getInstance().getPlatformManager().queryCapability(WORLD_EDITING).plugin;
	
	rolling_delay += delay;
	return scheduler.scheduleSyncDelayedTask(plugin, fn, rolling_delay);
}

const batch_delay = 1; // ticks






usage = "\n\n";
usage += "/cs spiralc <block> [gap] [spiral] [height] [count] [direction] [thread] [thickness]\n";
usage += "\n";
usage += "gap - Gap in radial sections (0+, can be a fraction)\n";
usage += "spiral - Number of spirals it will build with rotation (1+)\n";
usage += "height - Amount of coil height (0+)\n";
usage += "count - Number of coil segments generated (1+)\n";
usage += "direction - Alignment: east - e; west - w; south - s; north - n;\nup - u; down - d\n";
usage += "thread - Direction of the thread: left - l; right - r\n";
usage += "thickness - Thickness of the spiral (1+)\n";
usage += "\n";
usage += "Use '/cs spiralc <block>' to generate with default settings.";

context.checkArgs(1, -1, usage);

//localsession = context.getSession();

origin = player.getBlockIn().toVector().toBlockPoint();

debug_block = context.getBlock("redstone_block");

airblock = context.getBlock("air");

batch_num = 0
function batchedRadialArm(cX, cY, cZ, width, height, walltype, floortype, filltype){
	scheduleBatch( function(){
		editsession = context.remember();
		
		outerrad = Math.sqrt((cX * cX) + (cZ * cZ));
		innerrad = Math.max(0, outerrad - width);

		// fill in to the center
		num_blocks_filled = 0;
		if (filltype != airblock)
		{
			for(rad = outerrad - 1.0; rad > -0.5; rad = rad - 1.0)
			{
				ratio = rad / outerrad;
				sX = cX * ratio;
				sZ = cZ * ratio;
				//specialX = cX * (rad - 1.0) / outerrad;
				//specialZ = cZ * (rad - 1.0) / outerrad;
				
				for(sY = 0; sY < height + 0.5; sY++){
					editsession.setBlock(origin.add(sX, sY + cY, sZ), filltype);
					num_blocks_filled++;
					// Try to fill in gap blocks between the radii
					/*
					if (rad > innerrad + 1.0)
					{
						editsession.setBlock(origin.add(sX, sY + cY, specialZ), filltype);
						editsession.setBlock(origin.add(specialX, sY + cY, sZ), filltype);
					}
					*/
					
				}
				
			}
		}
		//context.print("filled " + num_blocks_filled );
		

		// make the floor
		num_blocks_filled = 0;
		for(rad = outerrad; rad > innerrad; rad = rad - 1.0)
		{
			ratio = rad / outerrad;
			sX = cX * ratio;
			sZ = cZ * ratio;
			editsession.setBlock(origin.add(sX, cY, sZ), floortype);
			num_blocks_filled++;
			
			// Try to fill in gap blocks between the radii
			/*
			if (rad > innerrad + 1.0)
			{
				specialX = cX * (rad - 1.0) / outerrad;
				specialZ = cZ * (rad - 1.0) / outerrad;
				editsession.setBlock(origin.add(sX, cY, specialZ), floortype);
				editsession.setBlock(origin.add(specialX, cY, sZ), floortype);
			}
			*/
			
		}
		//context.print("floor " + num_blocks_filled );
		
		// make the wall
		num_blocks_filled = 0;
		for(sY = 0; sY < height + 0.5; sY++){
			editsession.setBlock(origin.add(cX, sY + cY, cZ), walltype);
			num_blocks_filled++;
		}
		//context.print("wall " + num_blocks_filled );
		
		// Flush the batch
		//context.print("num changed blocks: " + editsession.getBlockChangeCount());	
		editsession.flushSession();
		//context.print("batch " + batch_num );
		batch_num++;
    }, batch_delay);
}

/*

// faster for testing
/cs spiral_sealed quartz_block end_stone_bricks air 1 1 6 3

// wtf? why is filling so costly, and getting costlier as we go up the spiral?
/cs spiral_sealed quartz_block end_stone_bricks glass 1 1 6 1

// provides filled in area, good for making a negative
/cs spiral_sealed quartz_block end_stone_bricks glass 1 1 6 6

/cs spiral_sealed walls floor fill <gap> <num_spiral> <coilheight> <coilcount>


// test for final
/cs spiral_sealed quartz_block end_stone_bricks glass 2 1 6 3
/cs spiral_sealed quartz_block end_stone_bricks air 2 1 6 3


/cs spiral_sealed quartz_block end_stone_bricks air 1.5 1 7 6

109, 98, 104 size, minus 25 blocks for portal bottom, that's 73. could be wider/taller

/cs spiral_sealed quartz_block end_stone_bricks air 1.6 1 8 6
115 112 111 size, minus 28 for portal, that's 84. 115 x 84 x 111 is perfect for the bottom.


/cs spiral_sealed quartz_block end_stone_bricks air 1.6 1 9 6
/cs spiral_sealed quartz_block end_stone_bricks glass 1.6 1 9 6
115 126 111 size, minus 32 for porta, that's 94. 115 x 94 x 111 is also perfect. I get side height of 18.

spcutter - filled sealed spiral
sptemple - hollow spiral to be decorated
spgrounds - sealed grounds with the cut
spterrain - original terrain








// testing holdoff

/cs spiral_sealed quartz_block end_stone_bricks glass 1.6 1 18 3 30
/cs spiral_sealed quartz_block end_stone_bricks air 1.6 1 18 3 30


// The real thing, mostly.
/cs spiral_sealed quartz_block end_stone_bricks air 1.6 1 18 6 30
// The filled thing, being used as a cutter. Start standing at y = 6
/cs spiral_sealed glass glass glass 1.6 1 18 8 30

// a slightly wider cutter for opening up the ocean
/cs spiral_sealed andesite glass glass 2.0 1 18 5 30


*/

if (argv.length > 1)  {
	walltype = context.getBlock(argv[1]);
	floortype = argv.length > 2 ? context.getBlock(argv[2]) : walltype;
	filltype = argv.length > 3 ? context.getBlock(argv[3]) : context.getBlock("air");
	
	gap = argv.length > 4 ? Number(argv[4]) : .5;
	spiral = argv.length > 5 ? Number(argv[5]) : 1;
	height = argv.length > 6 ? Number(argv[6]) : 3; // wall height in blocks
	coilCnt = argv.length > 7 ? Number(argv[7]) : 3;
	holdoff = argv.length > 8 ? (argv[8]) : 0;
	horiz = argv.length > 9 ? (argv[9]) : "y";
	thread = argv.length > 10 ? (argv[10]) : "l";
	

	gap = gap >= 0 ? gap : 40;

	maxAngle = Math.PI * 2 * coilCnt;
	degree = (Math.PI * 2) / spiral;
	compress = height/(Math.PI * 2);
	
	// parameters for thick()
	width = gap * Math.PI * 2 // floor width, seals between upper level wall and lower level wall
	
	// Give the edit session at least one block before batching
	//editsession.setBlock(origin, walltype);
	
	for (amount = 0; amount < spiral; amount++)
	{
		increment = 1; // how much to turn the sprial each loop iteration
		for (angle = 0; angle <= maxAngle; angle = angle + increment)
		{
			x = (angle * gap * Math.cos(angle + (amount * degree))) + 0.5;
			y = (angle * gap * Math.sin(angle + (amount * degree))) + 0.5;
			
			// holdoff flattens spiral at first before rising up.
			// holdoff measured in blocks (meters)
			z = Math.max(0, (angle*compress) - holdoff);
			
			
			
			// increment should get smaller as the spiral goes up, inversely proportional to R
			// R is angle * gap
			// * phi, for good measure. Hopefully fills in aliasing gaps
			increment = 1 / Math.max(1, angle * gap * (1.61803398875 + 0.5) * (amount + 1));

			if (thread == "r" || thread == "right")
			{
				x = -x;
			}
			
			if (horiz == "z" || horiz == "south" || horiz == "s") {
				batchedRadialArm(x, y, z, width, height, walltype, floortype, filltype);
			}
			if (horiz == "y" || horiz == "up" || horiz == "u") {
				batchedRadialArm(x, z, y, width, height, walltype, floortype, filltype);
			}
			if (horiz == "-z" || horiz == "north" || horiz == "n") {
				batchedRadialArm(x, (-y), (-z), width, height, walltype, floortype, filltype);
			}
			if (horiz == "-y" || horiz == "down" || horiz == "d") {
				batchedRadialArm(x, (-z), (-y), width, height, walltype, floortype, filltype);
			}
			if (horiz == "x" || horiz == "east" || horiz == "e") {
				batchedRadialArm(z, y, x, width, height, walltype, floortype, filltype);
			}
			if (horiz == "-x" || horiz == "west" || horiz == "w") {
				batchedRadialArm((-z), (-y), x, width, height, walltype, floortype, filltype);
			}
		}
	}
	var dir;
	if (horiz == "z" || horiz == "south" || horiz == "s") {
		dir = "south";
	}
	if (horiz == "y" || horiz == "up" || horiz == "u") {
		dir = "upward";
	}
	if (horiz == "-z" || horiz == "north" || horiz == "n") {
		dir = "north";
	}
	if (horiz == "-y" || horiz == "down" || horiz == "d") {
		dir = "downward";
	}
	if (horiz == "x" || horiz == "east" || horiz == "e") {
		dir = "east";
	}
	if (horiz == "-x" || horiz == "west" || horiz == "w") {
		dir = "west";
	}
	context.print(spiral + " conical spiral(s) generated with " + coilCnt + " coil(s), " + height + " block coil height, gap of " + gap + " in " + dir + " direction.");
}

scheduleBatch( function(){
		context.print("All batches done!");
	}, 0
)
