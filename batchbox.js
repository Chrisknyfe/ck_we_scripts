
// batchbox.js

importPackage(Packages.com.sk89q.worldedit);
importPackage(Packages.com.sk89q.worldedit.blocks);

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


const width = 10; // blocks obviously
const batch_delay = 5; // ticks
const block1 = context.getBlock("redstone_block");
const block2 = context.getBlock("emerald_block");

const origin_exact = player.getBlockIn().toVector() // for teleporation
const origin = origin_exact.toBlockPoint();

//editsession = context.remember(); // The entire structure should be undoable at once

function batchedRow(x, blocktype) {
    scheduleBatch( function(){
		
        if (x < width){
			
			editsession = context.remember(); // no history :/
			for (y = 0; y < width; y++)
			{
				for (z = 0; z < width; z++)
				{
					editsession.setBlock(origin.add(x, y+3, z), blocktype);
				}
			}
			
			context.print("num changed blocks: " + editsession.getBlockChangeCount());
			
			// this is probably wrong, but it works. Blocks pop into existence as soon as the batch finishes.
			editsession.flushSession();
			
			context.print("batched row " + x);
        }
    }, batch_delay);
};


	
for (x = 0; x < width; x++)
{
	batchedRow(x, block1);
}

// I don't know why but setting a single block makes the history for this script work.
// I'm guessing this makes the EditSession think it has one block it can undo,
// but then I come in later and add more blocks even though the EditSession thinks it's finished
// since the script is technically finished after this... 
// so, what happens if I //undo before all tasks are done? the history forgets this script's actions
// but the batches keep setting blocks (and they put back the undone blocks!)
// ...whatever, it works, yay me.
//editsession.setBlock(origin.add(0, 3, 0), block2);

context.print("async box width " + width);


scheduleBatch( function(){
		context.print("All batches done!");
	}, 0
)
