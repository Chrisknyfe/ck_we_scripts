
// asyncbox.js


/*

yea so you shouldn't be doing anything that modifies the world on another thread - use something like the bukkit scheduler to ensure you're on the main thread when flushing
calling context.remember stores the entire editsession object, not just a set of changes up to that point, which is why i said don't re-use the editsession
for each batch, you need to get an editsession, set blocks, flush, and remember
if you want the entire thing to be undone/redone at once, then you need to use the same editsession throughout, and only remember at the end
you should just ditch the timer entirely and make a repeating bukkit task which you cancel once you finish the last row
*/
importPackage(Packages.java.io);
importPackage(Packages.java.lang);
importPackage(Packages.java.util.concurrent);
importPackage(Packages.java.awt);
importPackage(Packages.com.sk89q.worldedit);
importPackage(Packages.com.sk89q.worldedit.blocks);

// bukkit scheduling
//importPackage(Packages.org.bukkit.Bukkit);
//importPackage(Packages.org.bukkit.plugin.java.JavaPlugin);
//importPackage(Packages.org.bukkit.scheduler.BukkitScheduler);

// WorldEdit plugin so we can get the scheduler
//importPackage(Packages.org.bukkit.plugin.PluginManager);

// if I can get the platform I can do platform.schedule(delay, period, task);
//importPackage(Packages.com.sk89q.worldedit.extension.platform.PlatformManager);
// who even owns a platform manager?
importPackage(Packages.com.sk89q.worldedit); // this does
// CraftScriptEnvironment has a protected Worldedit and a Platform!!! how do I get these?

importPackage(Packages.com.sk89q.worldedit.extension.platform);

importPackage(Packages.org.bukkit);

/*
var timer = new java.util.Timer();
var counter = 1;
var ids = {};

setTimeout = function(fn, delay) {
    var id = counter;
    counter += 1;
    ids[id] = new JavaAdapter(java.util.TimerTask, { run : fn });
    timer.schedule(ids[id], delay);
    return id;
};
*/

function scheduleOnce(fn, delay) {
	scheduler = org.bukkit.Bukkit.getScheduler();
	// This can't be real. There has to be a shorter way to do this.
	plugin = com.sk89q.worldedit.WorldEdit.getInstance().getPlatformManager().queryCapability(com.sk89q.worldedit.extension.platform.Capability.WORLD_EDITING).plugin;
	scheduler.scheduleSyncDelayedTask(plugin, fn, delay);
}


width = 10;
const build_delay = 10; // units are ticks
block1 = context.getBlock("redstone_block");
//block2 = context.getBlock("emerald_block");



sess = context.getSession();
//blocks = context.remember(); // I have an EditSession
//config = context.getConfiguration();
//sess.asdf(); // I have a LocalSession
//context.asdf(); // I have a CraftscriptContext
//player.asdf() // I have a PlayerProxy
	// I can get the world from this

// Scripts have the following three variables in their global namespace

/*
context.print("");

context.print("==== Initial Craftscript Global Objects ====");
context.print("context: " + context);
context.print("player: " + player);
context.print("argv: " + argv);

context.print("==== Descendent Objects ====");
context.print("sess: " + sess);
context.print("blocks: " + blocks);
context.print("config: " + config);
//context.print("server: " + context.server); // returns undefined... fuck!!!
//context.print("sess.getSelectionWorld(): " + sess.getSelectionWorld()); // but only if there's a selection.
context.print("player.getLocation(): " + player.getLocation());
context.print("player.getLocation().getExtent(): " + player.getLocation().getExtent());
context.print("player.getWorld().getWorld(): " + player.getWorld().getWorld());


// WorldEditPlugin may be a singleton I can get // no.
//context.print("WorldEditPlugin.getInstance(): " + com.sk89q.worldedit.WorldEditPlugin.getInstance());

// WorldEdit may be a singleton I can get // YES
we = com.sk89q.worldedit.WorldEdit.getInstance();
context.print("WorldEdit.getInstance(): " + we);
pm = we.getPlatformManager()
context.print("we.getPlatformManager(): " + pm);
platform = pm.queryCapability(com.sk89q.worldedit.extension.platform.Capability.WORLD_EDITING);
context.print("pm.queryCapability(WORLD_EDITING): " + platform);
context.print("platform.plugin: " + platform.plugin);


context.print("org.bukkit.Bukkit: " + org.bukkit.Bukkit);


//context.print("scheduler: " + scheduler);
*/

originpos = player.getBlockIn().toVector()
origin = originpos.toBlockPoint();

const slowbuildRow = (x, blocktype) => {
    scheduleOnce( function(){
		
        if (x < width){
			blocks = context.remember(); // I have an EditSession
			
			for (y = 0; y < width; y++)
			{
				for (z = 0; z < width; z++)
				{
					blocks.setBlock(origin.add(x, y+3, z), blocktype);
				}
			}
			
			// debugging row locations
			player.setPosition(originpos.add(x + 0.5, 0, 0.5));

			context.print("num changed blocks: " + blocks.getBlockChangeCount());
			
			// TODO: how do I get blocks to appear instantly, rather than having to discon/recon to reload the chunk?
			blocks.flushSession();
			
			context.print("slowbuild " + x);
            slowbuildRow(x+1, blocktype);
        }
    }, build_delay)
};
	
slowbuildRow(0, block1);

context.print("async box width " + width);

